// Difficulty tier system for progressive challenge scaling

export type DifficultyId = 'Normal' | 'Hard' | 'Expert' | 'Nightmare' | 'Legendary';

export interface DifficultyTier {
  id: DifficultyId;
  name: string;
  unlockGlory: number;        // Glory needed to unlock this tier
  requirementMultiplier: number; // How much harder challenges are (1.0 = base)
  rewardMultiplier: number;   // How much more glory/XP you earn (1.0 = base)
  description: string;
  color: string;              // UI color for this tier
  icon: string;               // Emoji or icon
}

export const DIFFICULTY_TIERS: DifficultyTier[] = [
  {
    id: 'Normal',
    name: 'Casual Campaign',
    unlockGlory: 0,
    requirementMultiplier: 1.0,
    rewardMultiplier: 1.0,
    description: 'Standard difficulty. Good for learning the game and trying new decks.',
    color: 'text-green-400',
    icon: '🎲'
  },
  {
    id: 'Hard',
    name: 'Seasoned Adventurer',
    unlockGlory: 500,
    requirementMultiplier: 1.5,
    rewardMultiplier: 2.0,
    description: 'Challenges require better card combos. Double glory rewards.',
    color: 'text-blue-400',
    icon: '⚔️'
  },
  {
    id: 'Expert',
    name: 'Legendary Hero',
    unlockGlory: 2000,
    requirementMultiplier: 2.0,
    rewardMultiplier: 3.5,
    description: 'Near-perfect card selection needed. Massive glory rewards.',
    color: 'text-purple-400',
    icon: '👑'
  },
  {
    id: 'Nightmare',
    name: 'Living Myth',
    unlockGlory: 5000,
    requirementMultiplier: 3.0,
    rewardMultiplier: 5.0,
    description: 'Requires optimized decks and perks. Epic rewards for the brave.',
    color: 'text-red-400',
    icon: '🔥'
  },
  {
    id: 'Legendary',
    name: 'Impossible Odds',
    unlockGlory: 10000,
    requirementMultiplier: 5.0,
    rewardMultiplier: 10.0,
    description: 'For masochists only. Can you beat the unbeatable?',
    color: 'text-amber-400',
    icon: '💀'
  }
];

/**
 * Get all difficulty tiers unlocked by the player's current glory
 */
export function getUnlockedDifficulties(glory: number): DifficultyTier[] {
  return DIFFICULTY_TIERS.filter(tier => glory >= tier.unlockGlory);
}

/**
 * Get the next difficulty tier to unlock
 */
export function getNextDifficultyToUnlock(glory: number): DifficultyTier | null {
  const locked = DIFFICULTY_TIERS.filter(tier => glory < tier.unlockGlory);
  return locked.length > 0 ? locked[0] : null;
}

/**
 * Get difficulty tier by ID
 */
export function getDifficultyById(id: DifficultyId): DifficultyTier {
  return DIFFICULTY_TIERS.find(tier => tier.id === id) || DIFFICULTY_TIERS[0];
}

/**
 * Check if a difficulty is unlocked
 */
export function isDifficultyUnlocked(difficultyId: DifficultyId, glory: number): boolean {
  const tier = getDifficultyById(difficultyId);
  return glory >= tier.unlockGlory;
}
