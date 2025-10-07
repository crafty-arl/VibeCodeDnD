import type { LoreCard, SkillPath, CardStats, SkillCheck } from '@/types/game';

const COMPANION_DATA_KEY = 'glesolas_companion_data';

interface CompanionData {
  [cardId: string]: {
    loyalty: number;
    timesPlayed: number;
    encountersWon: number;
    encountersLost: number;
    lastPlayed: number;
  };
}

export type LoyaltyTier = 'stranger' | 'acquaintance' | 'friend' | 'trusted' | 'legendary';

export class CompanionManager {
  static getCompanionData(): CompanionData {
    const data = localStorage.getItem(COMPANION_DATA_KEY);
    return data ? JSON.parse(data) : {};
  }

  static saveCompanionData(data: CompanionData): void {
    localStorage.setItem(COMPANION_DATA_KEY, JSON.stringify(data));
  }

  static recordCardPlay(
    cardId: string,
    won: boolean,
    pathChosen: SkillPath,
    keyStat: SkillPath | undefined,
    wasKeyStat: boolean
  ): number {
    const data = this.getCompanionData();
    const companion = data[cardId] || {
      loyalty: 0,
      timesPlayed: 0,
      encountersWon: 0,
      encountersLost: 0,
      lastPlayed: 0,
    };

    companion.timesPlayed += 1;
    companion.lastPlayed = Date.now();

    let loyaltyChange = 0;

    if (won && wasKeyStat) {
      companion.encountersWon += 1;
      loyaltyChange = +15;
    } else if (won && !wasKeyStat) {
      companion.encountersWon += 1;
      loyaltyChange = +5;
    } else {
      companion.encountersLost += 1;
      loyaltyChange = -20;
    }

    companion.loyalty = Math.max(0, companion.loyalty + loyaltyChange);

    data[cardId] = companion;
    this.saveCompanionData(data);

    return loyaltyChange;
  }

  static getLoyaltyTier(loyalty: number): LoyaltyTier {
    if (loyalty >= 1000) return 'legendary';
    if (loyalty >= 500) return 'trusted';
    if (loyalty >= 250) return 'friend';
    if (loyalty >= 100) return 'acquaintance';
    return 'stranger';
  }

  static getLoyaltyBonus(loyalty: number): CardStats {
    if (loyalty >= 1000) return { might: 4, fortune: 3, cunning: 2 };
    if (loyalty >= 500) return { might: 3, fortune: 2, cunning: 1 };
    if (loyalty >= 250) return { might: 2, fortune: 1, cunning: 0 };
    if (loyalty >= 100) return { might: 1, fortune: 0, cunning: 0 };
    return { might: 0, fortune: 0, cunning: 0 };
  }

  static enrichCard(card: LoreCard): LoreCard {
    if (card.type !== 'Character') return card;

    const data = this.getCompanionData();
    const companionData = data[card.id];

    if (!companionData) return card;

    return {
      ...card,
      loyalty: companionData.loyalty,
      timesPlayed: companionData.timesPlayed,
      encountersWon: companionData.encountersWon,
      encountersLost: companionData.encountersLost,
    };
  }

  static getAvailableAbilities(card: LoreCard): string[] {
    const loyalty = card.loyalty || 0;
    const abilities: string[] = [];

    if (loyalty >= 100) abilities.push('stat_focus');
    if (loyalty >= 250) abilities.push('key_stat_insight');
    if (loyalty >= 500) abilities.push('stat_conversion');
    if (loyalty >= 1000) abilities.push('perfect_execution');

    return abilities;
  }

  static createCompanionFromEncounter(
    challenge: SkillCheck,
    winningPath: SkillPath,
    playerLevel: number
  ): LoreCard {
    const enemyName = this.extractEnemyName(challenge.scene);

    const baseStats: CardStats = {
      might: Math.floor(challenge.requirements.might_req * 0.4),
      fortune: Math.floor(challenge.requirements.fortune_req * 0.4),
      cunning: Math.floor(challenge.requirements.cunning_req * 0.4),
    };

    baseStats[winningPath] += 3;

    return {
      id: `recruited_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${enemyName} (Reformed)`,
      type: 'Character',
      stats: baseStats,
      rarity: playerLevel >= 10 ? 'Rare' : 'Uncommon',
      flavor: `Defeated via ${winningPath}. Remembers your prowess.`,
      loyalty: 100,
      preferredPath: winningPath,
      timesPlayed: 0,
      encountersWon: 0,
      encountersLost: 0,
      dialogue: {
        onPlay: [
          `I still remember when you ${
            winningPath === 'might' ? 'crushed' : winningPath === 'cunning' ? 'outwitted' : 'outmaneuvered'
          } me...`,
          "Let's see if you're as good as I remember.",
        ],
        onWin: ['Just like when we fought!', "You haven't lost your edge."],
        onLose: ["Maybe I should've stayed your enemy...", 'This is embarrassing.'],
        onKeyStat: ['Smart play. That\'s why I joined you.', "Exactly how I would've done it."],
        onNonKeyStat: ['That worked, but barely...', 'We got lucky this time.'],
      },
    };
  }

  private static extractEnemyName(scene: string): string {
    const keywords = ['Bandit', 'Dragon', 'Goblin', 'Wizard', 'Beast', 'Knight', 'Assassin', 'Warrior', 'Mage'];
    for (const keyword of keywords) {
      if (scene.toLowerCase().includes(keyword.toLowerCase())) return keyword;
    }
    return 'Fighter';
  }
}
