// TPG-themed game types

export type CardType = 'Character' | 'Item' | 'Location';

export type SkillPath = 'might' | 'fortune' | 'cunning';

export interface CardStats {
  might: number;      // Power
  fortune: number;    // Luck
  cunning: number;    // Wit
}

export interface LoreCard {
  id: string;
  name: string;
  type: CardType;
  stats: CardStats;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  flavor: string;
  art?: string;

  // Companion system (Character cards only)
  loyalty?: number;
  timesPlayed?: number;
  encountersWon?: number;
  encountersLost?: number;
  preferredPath?: SkillPath;

  dialogue?: {
    onPlay: string[];
    onWin: string[];
    onLose: string[];
    onKeyStat: string[];
    onNonKeyStat: string[];
  };
}

export interface SkillCheck {
  scene: string;
  requirements: {
    might_req: number;
    fortune_req: number;
    cunning_req: number;
  };
  keyStat?: SkillPath; // The stat that provides full rewards this turn
}

export interface RollResult {
  path: SkillPath | 'fumble';
  success: boolean;
  total: CardStats;
  scene: string;
  gloryGained: number;
  narrativeDice: number;
  wasKeyStat?: boolean;
  consequences?: EncounterConsequence;
}

export interface EncounterConsequence {
  type: 'perfect' | 'partial' | 'failure';
  effects: {
    nextEncounterModifier?: number;
    injuryDebuff?: CardStats;
    companionLoyaltyHit?: boolean;
    lostCards?: string[];
    clearPendingModifier?: boolean;
  };
  message: string;
}

export interface CampaignSession {
  sessionId: string;
  glory: number;
  narrativeDice: number;
  encounters: Encounter[];
  activeCards: LoreCard[];
}

export interface Encounter {
  type: 'start' | 'skillCheck' | 'resolution';
  scene: string;
  skillCheck?: SkillCheck;
  result?: RollResult;
  timestamp: number;
  imageUrl?: string; // Generated scene illustration
}

export type GamePhase = 'home' | 'intro' | 'challenge' | 'action-choice' | 'resolution' | 'transition' | 'ended';

export interface ActionPath {
  path: SkillPath;
  narrative: string;
  unlocked: boolean;
  successChance?: number; // Percentage chance of success (0-100)
  isTotalFailure?: boolean; // True when all paths failed (choose your doom)
}
