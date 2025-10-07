import type { LoreCard, SkillCheck, RollResult, SkillPath, CardStats } from '@/types/game';
import type { PlayerProfile } from '@/types/player';
import { generateResolutionScene } from '@/data/scenes';
import { CompanionManager } from './companionManager';

export function calculateTotalStats(
  cards: LoreCard[],
  playerProfile?: PlayerProfile,
  includeCompanionBonuses = true
): CardStats {
  const baseStats = cards.reduce(
    (total, card) => ({
      might: total.might + card.stats.might,
      fortune: total.fortune + card.stats.fortune,
      cunning: total.cunning + card.stats.cunning,
    }),
    { might: 0, fortune: 0, cunning: 0 }
  );

  // Add companion loyalty bonuses
  if (includeCompanionBonuses) {
    cards
      .filter(c => c.type === 'Character' && c.loyalty)
      .forEach(card => {
        const bonus = CompanionManager.getLoyaltyBonus(card.loyalty!);
        baseStats.might += bonus.might;
        baseStats.fortune += bonus.fortune;
        baseStats.cunning += bonus.cunning;
      });
  }

  // Apply player bonus stats from leveling and perks
  if (playerProfile) {
    // Apply injuries
    let injuryDebuff = { might: 0, fortune: 0, cunning: 0 };
    if (playerProfile.activeInjuries && playerProfile.activeInjuries.length > 0) {
      playerProfile.activeInjuries.forEach(injury => {
        injuryDebuff.might += injury.statDebuff.might;
        injuryDebuff.fortune += injury.statDebuff.fortune;
        injuryDebuff.cunning += injury.statDebuff.cunning;
      });
    }

    return {
      might: baseStats.might + playerProfile.bonusStats.might + injuryDebuff.might,
      fortune: baseStats.fortune + playerProfile.bonusStats.fortune + injuryDebuff.fortune,
      cunning: baseStats.cunning + playerProfile.bonusStats.cunning + injuryDebuff.cunning,
    };
  }

  return baseStats;
}

export function determineSkillCheckResult(
  cards: LoreCard[],
  challenge: SkillCheck
): RollResult {
  const total = calculateTotalStats(cards);
  const { might_req, fortune_req, cunning_req } = challenge.requirements;

  // Check which skills meet requirements
  const mightSuccess = total.might >= might_req;
  const fortuneSuccess = total.fortune >= fortune_req;
  const cunningSuccess = total.cunning >= cunning_req;

  // Determine best path
  let path: SkillPath | 'fumble' = 'fumble';
  let success = false;

  if (mightSuccess || fortuneSuccess || cunningSuccess) {
    success = true;
    // Pick the highest total among successful paths
    const scores = [
      { path: 'might' as const, value: total.might, success: mightSuccess },
      { path: 'fortune' as const, value: total.fortune, success: fortuneSuccess },
      { path: 'cunning' as const, value: total.cunning, success: cunningSuccess },
    ];

    const successfulScores = scores.filter(s => s.success);
    successfulScores.sort((a, b) => b.value - a.value);
    path = successfulScores[0].path;
  }

  // Calculate rewards (TPG-themed)
  const gloryGained = success
    ? path === 'might'
      ? 50
      : path === 'fortune'
      ? 40
      : 60 // cunning grants most glory
    : 20; // fumbles still grant some XP

  const narrativeDice = success ? 2 : 1;

  const scene = success
    ? generateResolutionScene(path as SkillPath, true)
    : generateResolutionScene('fortune', false); // Default fumble narrative

  return {
    path,
    success,
    total,
    scene,
    gloryGained,
    narrativeDice,
  };
}

// Session state management (localStorage)
export function saveSessionToStorage(sessionId: string, data: any): void {
  localStorage.setItem(`glesolas_session_${sessionId}`, JSON.stringify(data));
}

export function loadSessionFromStorage(sessionId: string): any | null {
  const data = localStorage.getItem(`glesolas_session_${sessionId}`);
  return data ? JSON.parse(data) : null;
}

export function clearSession(sessionId: string): void {
  localStorage.removeItem(`glesolas_session_${sessionId}`);
}
