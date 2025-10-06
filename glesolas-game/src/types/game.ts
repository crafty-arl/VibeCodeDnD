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
}

export interface SkillCheck {
  scene: string;
  requirements: {
    might_req: number;
    fortune_req: number;
    cunning_req: number;
  };
}

export interface RollResult {
  path: SkillPath | 'fumble';
  success: boolean;
  total: CardStats;
  scene: string;
  gloryGained: number;
  narrativeDice: number;
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
}

export type GamePhase = 'home' | 'intro' | 'challenge' | 'action-choice' | 'resolution' | 'transition' | 'ended';

export interface ActionPath {
  path: SkillPath;
  narrative: string;
  unlocked: boolean;
}
