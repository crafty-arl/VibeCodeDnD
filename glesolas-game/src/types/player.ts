// Player progression and leveling system

import type { CardStats } from './game';

export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  currentXP: number;
  totalXP: number; // Lifetime XP earned
  glory: number; // Legacy currency
  narrativeDice: number; // Resource for special actions

  // Difficulty selection
  selectedDifficulty: 'Normal' | 'Hard' | 'Expert' | 'Nightmare' | 'Legendary'; // Current difficulty tier

  // Skill bonuses from leveling
  bonusStats: {
    might: number;
    fortune: number;
    cunning: number;
  };

  // Progression unlocks
  handSize: number; // Cards drawn per encounter (starts at 3, max 5)
  playAreaSize: number; // Cards that can be played (starts at 1, max 3)

  // Unlockable perks
  perks: PlayerPerk[];
  availablePerkPoints: number;

  // Achievements/milestones
  achievements: Achievement[];

  // Play stats
  stats: PlayerStats;

  // Consequence tracking
  threatLevel?: number; // 0-10
  partialSuccessStreak?: number;
  activeInjuries?: Injury[];
  pendingEncounterModifier?: number; // Modifier for next encounter

  // Companion collection
  collectedCompanions?: string[]; // Card IDs
}

export interface Injury {
  id: string;
  name: string;
  description: string;
  statDebuff: CardStats;
  encountersRemaining: number;
}

export interface PlayerPerk {
  id: string;
  name: string;
  description: string;
  type: 'stat-boost' | 'resource' | 'special' | 'progression';
  requirement?: number; // Minimum level
  acquired: boolean;

  // Effects
  effect?: {
    mightBonus?: number;
    fortuneBonus?: number;
    cunningBonus?: number;
    narrativeDiceBonus?: number;
    handSizeBonus?: number; // Extra hand slots
    playAreaBonus?: number; // Extra play area slots
    rerollCount?: number; // Extra rerolls
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number; // timestamp
  reward?: {
    xp?: number;
    perkPoints?: number;
    narrativeDice?: number;
  };
}

export interface PlayerStats {
  encountersCompleted: number;
  encountersSucceeded: number;
  encountersFailed: number;
  totalGloryEarned: number;
  mightPathsTaken: number;
  fortunePathsTaken: number;
  cunningPathsTaken: number;
  cardsPlayed: number;
  sessionsStarted: number;
  sessionsCompleted: number;
  highestStreak: number;
  currentStreak: number;
}

export interface LevelUpResult {
  newLevel: number;
  perksUnlocked: PlayerPerk[];
  perkPointsEarned: number;
  statBoosts: {
    might: number;
    fortune: number;
    cunning: number;
  };
  achievementsUnlocked: Achievement[];
}
