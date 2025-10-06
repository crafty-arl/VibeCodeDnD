import type { VoiceType } from './audioService';

export interface NarratorPreset {
  id: string;
  name: string;
  description: string;
  personality: string;
  tone: string;
  style: string;
  systemPrompt: string;
  voice: VoiceType; // Voice for narration
  createdAt: number;
  updatedAt: number;
}

const NARRATORS_KEY = 'glesolas_narrators';
const ACTIVE_NARRATOR_KEY = 'glesolas_active_narrator';
const DEFAULT_NARRATOR_ID = 'default_narrator';

// Default narrator presets
const DEFAULT_NARRATORS: NarratorPreset[] = [
  {
    id: DEFAULT_NARRATOR_ID,
    name: 'Classic TPG DM',
    description: 'The original witty, self-aware DM with tabletop gaming humor',
    personality: 'Witty, self-aware, humorous',
    tone: 'Light-hearted with gaming culture references',
    style: 'Concise (2-3 sentences), entertaining',
    voice: 'nova', // Clear, energetic voice
    systemPrompt: `I'm your DM for this GLESOLAS adventure, and I'm speaking directly to you at the table.
I describe what YOU see, what YOU do, and what happens around YOU - never in third-person.
I keep it to 2-3 sentences with tabletop gaming humor, always addressing you directly as "you" or by your character's actions.`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'epic_fantasy',
    name: 'Epic Fantasy DM',
    description: 'Grand, dramatic DM who treats every moment as legendary',
    personality: 'Grandiose, dramatic, epic',
    tone: 'Heroic and mythical',
    style: 'Flowing prose with dramatic flair',
    voice: 'onyx', // Deep, authoritative voice
    systemPrompt: `I'm your DM, and I'm telling YOU an epic saga worthy of legend!
I describe YOUR heroic deeds and YOUR encounters with dramatic flair, speaking directly to you as the hero of this tale.
Every action YOU take becomes legendary in my 2-3 sentences of grand storytelling - always using "you" and "your".`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'snarky_dm',
    name: 'Snarky Game Master',
    description: 'Sarcastic, cynical DM who roasts the players',
    personality: 'Sarcastic, cynical, brutally honest',
    tone: 'Dark humor and playful mockery',
    style: 'Sharp, witty one-liners',
    voice: 'echo', // Warm, conversational voice with attitude
    systemPrompt: `I'm your DM, and I've seen every bad decision in the book - YOU'RE about to add a few more to my collection.
I describe what YOU'RE doing with sarcasm and dark humor, calling out YOUR terrible rolls and questionable choices directly.
My sharp commentary is aimed at YOU in 2-3 sentences, using "you" and "your" to make sure you know I'm talking to you.`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'wholesome_guide',
    name: 'Wholesome Adventure DM',
    description: 'Supportive, encouraging DM who celebrates every moment',
    personality: 'Encouraging, supportive, wholesome',
    tone: 'Positive and uplifting',
    style: 'Warm and friendly',
    voice: 'shimmer', // Soft, gentle voice
    systemPrompt: `I'm your DM for this GLESOLAS journey, and I'm here to make sure YOU have a wonderful time!
I describe what YOU accomplish with warmth and encouragement, celebrating YOUR successes and finding silver linings in YOUR setbacks.
My words are aimed directly at YOU in 2-3 uplifting sentences, always using "you" and "your" to make you feel like the hero you are!`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'noir_detective',
    name: 'Noir Detective DM',
    description: 'Gritty, hard-boiled DM who narrates in film noir style',
    personality: 'Cynical, world-weary, observant',
    tone: 'Dark, atmospheric, noir',
    style: 'Short, punchy sentences',
    voice: 'alloy', // Balanced, neutral voice
    systemPrompt: `I'm running this GLESOLAS game, and YOU just walked into my office - a case I can't crack.
I describe what YOU do in hard-boiled detective style, watching YOUR every move with cynical eyes.
Short, punchy sentences aimed at YOU. Two or three. That's how I roll with my players.`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'chaotic_goblin',
    name: 'Chaotic Goblin DM',
    description: 'Unhinged, chaotic DM who loves mayhem',
    personality: 'Chaotic, excitable, unpredictable',
    tone: 'Wild energy and random humor',
    style: 'Frantic and energetic',
    voice: 'fable', // Expressive, storytelling voice
    systemPrompt: `ME YOUR DM! ME TELL YOU WHAT YOU DO WITH CHAOS AND EXPLOSIONS!
I describe what YOU doing with wild goblin energy - YOU storm, YOU smash, YOU make mayhem!
Two-three sentences telling YOU about YOUR chaos! Always "you" and "your"! WHEEE!`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export class NarratorManager {
  static getAllNarrators(): NarratorPreset[] {
    const stored = localStorage.getItem(NARRATORS_KEY);
    if (!stored) {
      // Initialize with default narrators
      this.saveNarrators(DEFAULT_NARRATORS);
      return DEFAULT_NARRATORS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_NARRATORS;
    }
  }

  static saveNarrators(narrators: NarratorPreset[]): void {
    localStorage.setItem(NARRATORS_KEY, JSON.stringify(narrators));
  }

  static getNarrator(narratorId: string): NarratorPreset | null {
    const narrators = this.getAllNarrators();
    return narrators.find(n => n.id === narratorId) || null;
  }

  static createNarrator(
    name: string,
    description: string,
    personality: string,
    tone: string,
    style: string,
    systemPrompt: string,
    voice: VoiceType = 'nova'
  ): NarratorPreset {
    const narrators = this.getAllNarrators();
    const newNarrator: NarratorPreset = {
      id: `narrator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      personality,
      tone,
      style,
      systemPrompt,
      voice,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    narrators.push(newNarrator);
    this.saveNarrators(narrators);
    return newNarrator;
  }

  static updateNarrator(narratorId: string, updates: Partial<Omit<NarratorPreset, 'id' | 'createdAt'>>): void {
    const narrators = this.getAllNarrators();
    const index = narrators.findIndex(n => n.id === narratorId);

    if (index !== -1) {
      narrators[index] = {
        ...narrators[index],
        ...updates,
        updatedAt: Date.now(),
      };
      this.saveNarrators(narrators);
    }
  }

  static deleteNarrator(narratorId: string): void {
    // Prevent deleting default narrators
    if (DEFAULT_NARRATORS.some(n => n.id === narratorId)) {
      console.warn('Cannot delete default narrator');
      return;
    }

    const narrators = this.getAllNarrators().filter(n => n.id !== narratorId);
    this.saveNarrators(narrators);

    // If deleted narrator was active, switch to default
    if (this.getActiveNarratorId() === narratorId) {
      this.setActiveNarrator(DEFAULT_NARRATOR_ID);
    }
  }

  static getActiveNarratorId(): string {
    return localStorage.getItem(ACTIVE_NARRATOR_KEY) || DEFAULT_NARRATOR_ID;
  }

  static getActiveNarrator(): NarratorPreset {
    const narratorId = this.getActiveNarratorId();
    console.log('🎭 Active Narrator ID:', narratorId);
    const narrator = this.getNarrator(narratorId);
    const result = narrator || DEFAULT_NARRATORS[0];

    // Migration: ensure voice field exists
    if (!result.voice) {
      result.voice = 'nova';
      this.updateNarrator(result.id, { voice: 'nova' });
    }

    console.log('🎭 Active Narrator:', result.name, 'Voice:', result.voice);
    return result;
  }

  static setActiveNarrator(narratorId: string): void {
    console.log('🎭 Setting Active Narrator:', narratorId);
    localStorage.setItem(ACTIVE_NARRATOR_KEY, narratorId);
    const narrator = this.getNarrator(narratorId);
    console.log('🎭 New Active Narrator:', narrator?.name);
  }

  static getSystemPrompt(): string {
    return this.getActiveNarrator().systemPrompt;
  }
}
