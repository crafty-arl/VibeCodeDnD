import type { PlayerProfile, PlayerPerk, Achievement, LevelUpResult } from '@/types/player';
import { getDifficultyById } from '@/types/difficulty';

// XP requirements for each level (exponential growth)
export function getXPRequiredForLevel(level: number): number {
  // Formula: 100 * (level^1.5)
  // Level 1->2: 141 XP
  // Level 2->3: 245 XP
  // Level 3->4: 374 XP
  // Level 4->5: 523 XP
  // Level 5->6: 690 XP
  // Level 10->11: 1,732 XP
  // Level 20->21: 4,899 XP
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Get total XP needed to reach a level from level 1
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPRequiredForLevel(i);
  }
  return total;
}

// Calculate level from total XP
export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpNeeded = 0;

  while (xpNeeded <= totalXP) {
    level++;
    xpNeeded += getXPRequiredForLevel(level - 1);
  }

  return level - 1;
}

// Get XP progress within current level
export function getXPProgressInLevel(totalXP: number): { current: number; required: number; percentage: number } {
  const level = getLevelFromXP(totalXP);
  const xpForCurrentLevel = getTotalXPForLevel(level);
  const xpForNextLevel = getTotalXPForLevel(level + 1);

  const current = totalXP - xpForCurrentLevel;
  const required = xpForNextLevel - xpForCurrentLevel;
  const percentage = (current / required) * 100;

  return { current, required, percentage };
}

// Available perks system
export const AVAILABLE_PERKS: PlayerPerk[] = [
  // Tier 1 - Level 2+
  {
    id: 'might_adept',
    name: 'Might Adept',
    description: '+2 Might to all card combinations',
    type: 'stat-boost',
    requirement: 2,
    acquired: false,
    effect: { mightBonus: 2 }
  },
  {
    id: 'fortune_adept',
    name: 'Fortune Adept',
    description: '+2 Fortune to all card combinations',
    type: 'stat-boost',
    requirement: 2,
    acquired: false,
    effect: { fortuneBonus: 2 }
  },
  {
    id: 'cunning_adept',
    name: 'Cunning Adept',
    description: '+2 Cunning to all card combinations',
    type: 'stat-boost',
    requirement: 2,
    acquired: false,
    effect: { cunningBonus: 2 }
  },

  // Tier 2 - Level 5+
  {
    id: 'second_card_slot',
    name: 'Second Card Slot',
    description: 'Unlock ability to play 2 cards (up from 1)',
    type: 'progression',
    requirement: 5,
    acquired: false,
    effect: { playAreaBonus: 1 }
  },
  {
    id: 'narrative_wellspring',
    name: 'Narrative Wellspring',
    description: 'Start each session with +20 Narrative Dice',
    type: 'resource',
    requirement: 5,
    acquired: false,
    effect: { narrativeDiceBonus: 20 }
  },
  {
    id: 'expanded_hand',
    name: 'Expanded Hand',
    description: 'Draw 4 cards instead of 3 (+1 hand size)',
    type: 'progression',
    requirement: 7,
    acquired: false,
    effect: { handSizeBonus: 1 }
  },

  // Tier 3 - Level 10+
  {
    id: 'third_card_slot',
    name: 'Third Card Slot',
    description: 'Unlock ability to play 3 cards (up from 2)',
    type: 'progression',
    requirement: 10,
    acquired: false,
    effect: { playAreaBonus: 1 }
  },
  {
    id: 'might_master',
    name: 'Might Master',
    description: '+5 Might to all card combinations',
    type: 'stat-boost',
    requirement: 10,
    acquired: false,
    effect: { mightBonus: 5 }
  },
  {
    id: 'fortune_master',
    name: 'Fortune Master',
    description: '+5 Fortune to all card combinations',
    type: 'stat-boost',
    requirement: 10,
    acquired: false,
    effect: { fortuneBonus: 5 }
  },
  {
    id: 'cunning_master',
    name: 'Cunning Master',
    description: '+5 Cunning to all card combinations',
    type: 'stat-boost',
    requirement: 10,
    acquired: false,
    effect: { cunningBonus: 5 }
  },
  {
    id: 'master_hand',
    name: 'Master Hand',
    description: 'Draw 5 cards instead of 4 (+1 hand size)',
    type: 'progression',
    requirement: 12,
    acquired: false,
    effect: { handSizeBonus: 1 }
  },

  // Tier 4 - Level 15+
  {
    id: 'legend_in_making',
    name: 'Legend in the Making',
    description: '+3 to ALL stats',
    type: 'stat-boost',
    requirement: 15,
    acquired: false,
    effect: { mightBonus: 3, fortuneBonus: 3, cunningBonus: 3 }
  },
  {
    id: 'master_storyteller',
    name: 'Master Storyteller',
    description: 'Gain double Narrative Dice from encounters',
    type: 'special',
    requirement: 15,
    acquired: false
  },

  // Tier 5 - Level 20+
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: '+10 to your chosen primary stat',
    type: 'stat-boost',
    requirement: 20,
    acquired: false
  }
];

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first encounter',
    unlocked: false,
    reward: { xp: 50 }
  },
  {
    id: 'might_specialist',
    name: 'Might Specialist',
    description: 'Complete 10 encounters using the Might path',
    unlocked: false,
    reward: { xp: 100, perkPoints: 1 }
  },
  {
    id: 'fortune_specialist',
    name: 'Fortune Specialist',
    description: 'Complete 10 encounters using the Fortune path',
    unlocked: false,
    reward: { xp: 100, perkPoints: 1 }
  },
  {
    id: 'cunning_specialist',
    name: 'Cunning Specialist',
    description: 'Complete 10 encounters using the Cunning path',
    unlocked: false,
    reward: { xp: 100, perkPoints: 1 }
  },
  {
    id: 'perfect_run',
    name: 'Perfect Run',
    description: 'Win 5 encounters in a row without failure',
    unlocked: false,
    reward: { xp: 200, perkPoints: 1, narrativeDice: 50 }
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 encounters',
    unlocked: false,
    reward: { xp: 500, perkPoints: 2 }
  },
  {
    id: 'level_10',
    name: 'Rising Legend',
    description: 'Reach level 10',
    unlocked: false,
    reward: { narrativeDice: 100, perkPoints: 1 }
  },
  {
    id: 'level_20',
    name: 'Living Myth',
    description: 'Reach level 20',
    unlocked: false,
    reward: { narrativeDice: 200, perkPoints: 2 }
  }
];

// Create a new player profile
export function createPlayerProfile(name: string = 'Hero'): PlayerProfile {
  return {
    id: crypto.randomUUID(),
    name,
    level: 1,
    currentXP: 0,
    totalXP: 0,
    glory: 0,
    narrativeDice: 100,
    selectedDifficulty: 'Normal', // Start on Normal difficulty
    bonusStats: {
      might: 0,
      fortune: 0,
      cunning: 0
    },
    handSize: 3, // Start with 3 cards
    playAreaSize: 1, // Start with 1 play slot
    perks: [],
    availablePerkPoints: 0,
    achievements: ACHIEVEMENTS.map(a => ({ ...a })),
    stats: {
      encountersCompleted: 0,
      encountersSucceeded: 0,
      encountersFailed: 0,
      totalGloryEarned: 0,
      mightPathsTaken: 0,
      fortunePathsTaken: 0,
      cunningPathsTaken: 0,
      cardsPlayed: 0,
      sessionsStarted: 0,
      sessionsCompleted: 0,
      highestStreak: 0,
      currentStreak: 0
    }
  };
}

// Award XP and check for level ups
export function awardXP(profile: PlayerProfile, xpAmount: number): LevelUpResult | null {
  const oldLevel = profile.level;
  profile.currentXP += xpAmount;
  profile.totalXP += xpAmount;

  const newLevel = getLevelFromXP(profile.totalXP);

  if (newLevel > oldLevel) {
    return handleLevelUp(profile, oldLevel, newLevel);
  }

  return null;
}

// Handle level up logic
function handleLevelUp(profile: PlayerProfile, oldLevel: number, newLevel: number): LevelUpResult {
  profile.level = newLevel;

  // Award perk points (1 per level, bonus at milestones)
  const levelsGained = newLevel - oldLevel;
  let perkPointsEarned = levelsGained;

  // Bonus perk points at milestones
  for (let level = oldLevel + 1; level <= newLevel; level++) {
    if (level % 5 === 0) perkPointsEarned += 1; // Extra point every 5 levels
    if (level === 10 || level === 20) perkPointsEarned += 1; // Extra at major milestones
  }

  profile.availablePerkPoints += perkPointsEarned;

  // Auto-grant small stat boosts each level
  const statBoosts = {
    might: levelsGained,
    fortune: levelsGained,
    cunning: levelsGained
  };
  profile.bonusStats.might += statBoosts.might;
  profile.bonusStats.fortune += statBoosts.fortune;
  profile.bonusStats.cunning += statBoosts.cunning;

  // Check for newly unlocked perks
  const perksUnlocked = AVAILABLE_PERKS.filter(
    perk => !perk.acquired && perk.requirement === newLevel
  );

  // Check for level-based achievements
  const achievementsUnlocked: Achievement[] = [];
  if (newLevel === 10) {
    const achievement = profile.achievements.find(a => a.id === 'level_10');
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      achievementsUnlocked.push(achievement);
      if (achievement.reward?.narrativeDice) {
        profile.narrativeDice += achievement.reward.narrativeDice;
      }
      if (achievement.reward?.perkPoints) {
        profile.availablePerkPoints += achievement.reward.perkPoints;
      }
    }
  }
  if (newLevel === 20) {
    const achievement = profile.achievements.find(a => a.id === 'level_20');
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      achievementsUnlocked.push(achievement);
      if (achievement.reward?.narrativeDice) {
        profile.narrativeDice += achievement.reward.narrativeDice;
      }
      if (achievement.reward?.perkPoints) {
        profile.availablePerkPoints += achievement.reward.perkPoints;
      }
    }
  }

  return {
    newLevel,
    perksUnlocked,
    perkPointsEarned,
    statBoosts,
    achievementsUnlocked
  };
}

// Apply a perk to the profile
export function applyPerk(profile: PlayerProfile, perkId: string): boolean {
  if (profile.availablePerkPoints < 1) return false;

  const perk = AVAILABLE_PERKS.find(p => p.id === perkId);
  if (!perk) return false;
  if (perk.requirement && profile.level < perk.requirement) return false;
  if (profile.perks.some(p => p.id === perkId)) return false; // Already acquired

  const acquiredPerk = { ...perk, acquired: true };
  profile.perks.push(acquiredPerk);
  profile.availablePerkPoints -= 1;

  // Apply perk effects to bonus stats
  if (perk.effect?.mightBonus) profile.bonusStats.might += perk.effect.mightBonus;
  if (perk.effect?.fortuneBonus) profile.bonusStats.fortune += perk.effect.fortuneBonus;
  if (perk.effect?.cunningBonus) profile.bonusStats.cunning += perk.effect.cunningBonus;
  if (perk.effect?.narrativeDiceBonus) profile.narrativeDice += perk.effect.narrativeDiceBonus;

  // Apply progression unlocks
  if (perk.effect?.handSizeBonus) profile.handSize += perk.effect.handSizeBonus;
  if (perk.effect?.playAreaBonus) profile.playAreaSize += perk.effect.playAreaBonus;

  return true;
}

// Check and unlock achievements
export function checkAchievements(profile: PlayerProfile): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  profile.achievements.forEach(achievement => {
    if (achievement.unlocked) return;

    let shouldUnlock = false;

    switch (achievement.id) {
      case 'first_steps':
        shouldUnlock = profile.stats.encountersCompleted >= 1;
        break;
      case 'might_specialist':
        shouldUnlock = profile.stats.mightPathsTaken >= 10;
        break;
      case 'fortune_specialist':
        shouldUnlock = profile.stats.fortunePathsTaken >= 10;
        break;
      case 'cunning_specialist':
        shouldUnlock = profile.stats.cunningPathsTaken >= 10;
        break;
      case 'perfect_run':
        shouldUnlock = profile.stats.currentStreak >= 5;
        break;
      case 'century_club':
        shouldUnlock = profile.stats.encountersCompleted >= 100;
        break;
    }

    if (shouldUnlock) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      newlyUnlocked.push(achievement);

      // Apply rewards
      if (achievement.reward?.xp) {
        awardXP(profile, achievement.reward.xp);
      }
      if (achievement.reward?.perkPoints) {
        profile.availablePerkPoints += achievement.reward.perkPoints;
      }
      if (achievement.reward?.narrativeDice) {
        profile.narrativeDice += achievement.reward.narrativeDice;
      }
    }
  });

  return newlyUnlocked;
}

// Update player stats after an encounter
export function updateEncounterStats(profile: PlayerProfile, success: boolean, path: 'might' | 'fortune' | 'cunning' | 'fumble', gloryGained: number, cardsUsed: number): void {
  profile.stats.encountersCompleted += 1;

  if (success) {
    profile.stats.encountersSucceeded += 1;
    profile.stats.currentStreak += 1;
    if (profile.stats.currentStreak > profile.stats.highestStreak) {
      profile.stats.highestStreak = profile.stats.currentStreak;
    }
  } else {
    profile.stats.encountersFailed += 1;
    profile.stats.currentStreak = 0;
  }

  profile.stats.totalGloryEarned += gloryGained;
  profile.stats.cardsPlayed += cardsUsed;

  if (path === 'might') profile.stats.mightPathsTaken += 1;
  if (path === 'fortune') profile.stats.fortunePathsTaken += 1;
  if (path === 'cunning') profile.stats.cunningPathsTaken += 1;

  // Check for achievements
  checkAchievements(profile);
}

// Storage keys
const STORAGE_KEY = 'glesolas_player_profile';

// Save profile to localStorage
export function savePlayerProfile(profile: PlayerProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

// Load profile from localStorage
export function loadPlayerProfile(): PlayerProfile | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const profile = JSON.parse(saved) as PlayerProfile;
    return profile;
  } catch (error) {
    console.error('Failed to load player profile:', error);
    return null;
  }
}

// Get or create profile
export function getOrCreatePlayerProfile(): PlayerProfile {
  const existing = loadPlayerProfile();
  if (existing) {
    // Migrate old profiles to new system
    if (existing.handSize === undefined) {
      existing.handSize = 3;
    }
    if (existing.playAreaSize === undefined) {
      existing.playAreaSize = 1;
    }
    if (existing.selectedDifficulty === undefined) {
      existing.selectedDifficulty = 'Normal';
    }
    return existing;
  }

  const newProfile = createPlayerProfile();
  savePlayerProfile(newProfile);
  return newProfile;
}

// Reset profile (for testing or new game+)
export function resetPlayerProfile(): PlayerProfile {
  const newProfile = createPlayerProfile();
  savePlayerProfile(newProfile);
  return newProfile;
}

// Calculate challenge stat requirements based on player level and progression
export function getScaledChallengeRequirements(playerProfile: PlayerProfile): {
  might_req: number;
  fortune_req: number;
  cunning_req: number;
} {
  const level = playerProfile.level;
  const playAreaSize = playerProfile.playAreaSize;

  // Get current difficulty tier
  const difficulty = getDifficultyById(playerProfile.selectedDifficulty || 'Normal');

  // REBALANCED: Base calculation targets 70% of available stats
  // Average card provides ~6 total stats / 3 = 2 per stat
  // Player can select up to playAreaSize cards
  // So available stats per type ≈ playAreaSize * 2
  // Target 70% means challenges should require ~playAreaSize * 1.4
  const basePerCard = 3.5; // Reduced from 5 to make challenges more achievable

  // Add gentler level scaling (level^0.8 instead of level^1.2)
  const levelBonus = Math.pow(level, 0.8);

  // Calculate base requirement
  const baseRequirement = playAreaSize * basePerCard + levelBonus;

  // Apply difficulty multiplier
  const scaledRequirement = baseRequirement * difficulty.requirementMultiplier;

  // Apply pending encounter modifier (capped at +3 in App.tsx)
  const pendingModifier = playerProfile.pendingEncounterModifier || 0;

  // Threat level has reduced impact (50% of previous)
  const threatModifier = (playerProfile.threatLevel || 0) * 0.5;

  // Reduced variance (±15% instead of ±25% for more predictable challenges)
  const variance = 0.15;
  const might_req = Math.floor((scaledRequirement + pendingModifier + threatModifier) * (1 + (Math.random() - 0.5) * variance));
  const fortune_req = Math.floor((scaledRequirement + pendingModifier + threatModifier) * (1 + (Math.random() - 0.5) * variance));
  const cunning_req = Math.floor((scaledRequirement + pendingModifier + threatModifier) * (1 + (Math.random() - 0.5) * variance));

  return {
    might_req: Math.max(2, might_req), // Reduced minimum from 3 to 2
    fortune_req: Math.max(2, fortune_req),
    cunning_req: Math.max(2, cunning_req)
  };
}
