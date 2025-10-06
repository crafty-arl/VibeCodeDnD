// Playground Mode Types - Creative Storytelling Sandbox

import type { LoreCard, SkillPath } from './game';

export type NarrativePromptType = 'scene' | 'character-action' | 'plot-twist' | 'tone-shift' | 'question';

export interface NarrativePrompt {
  type: NarrativePromptType;
  prompt: string;
  cards?: LoreCard[];
}

export interface PlaygroundChallenge {
  context: string;
  narrativeQuestion: string;
  suggestedApproaches: {
    path: SkillPath;
    narrative: string;
  }[];
  allowCustomApproach: boolean;
}

export interface StoryMemory {
  sessionId: string;
  genre: string;
  keyEvents: string[];
  characters: Record<string, string>;
  locations: Record<string, string>;
  relationships: string[];
  themes: string[];
  narrativeSummary: string;
  currentTone: string;
}

export interface PlaygroundScene {
  id: string;
  narrative: string;
  playerAction?: string;
  cardsUsed: string[];
  timestamp: number;
}

export interface PlaygroundStory {
  id: string;
  title: string;
  summary: string;
  genre: string[];
  scenes: PlaygroundScene[];
  totalLength: number;
  cardsUsed: string[];
  createdAt: number;
  isPublic: boolean;
  shareCode?: string;
  playerChoices: number;
  memory: StoryMemory;
}

export type PlaygroundPhase =
  | 'setup'
  | 'custom-opening'
  | 'playing'
  | 'story-complete';

export type PlaygroundStartMode = 'quick' | 'custom' | 'theme';

export type ThemeOption = 'mystery' | 'action' | 'comedy' | 'horror' | 'romance' | 'epic';
