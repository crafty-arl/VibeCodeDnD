// Story Memory Manager - Tracks narrative continuity for Playground Mode

import type { StoryMemory } from '../types/playground';

export class StoryMemoryManager {
  private static readonly STORAGE_KEY = 'glesolas_story_memory';

  static createInitialMemory(genre: string = 'fantasy'): StoryMemory {
    return {
      sessionId: `story_${Date.now()}`,
      genre,
      keyEvents: [],
      characters: {},
      locations: {},
      relationships: [],
      themes: [],
      narrativeSummary: '',
      currentTone: 'neutral',
    };
  }

  static updateMemory(
    memory: StoryMemory,
    newScene: string,
    playerChoice?: string
  ): StoryMemory {
    // Extract key information from the scene
    const events = this.extractKeyEvents(newScene);
    const characters = this.extractCharacters(newScene);
    const tone = this.detectTone(newScene);

    // Update narrative summary
    const updatedSummary = this.condenseSummary(
      memory.narrativeSummary,
      newScene,
      playerChoice
    );

    return {
      ...memory,
      keyEvents: [...memory.keyEvents, ...events].slice(-10), // Keep last 10 events
      characters: { ...memory.characters, ...characters },
      currentTone: tone,
      narrativeSummary: updatedSummary,
    };
  }

  private static extractKeyEvents(scene: string): string[] {
    // Simple extraction - look for action-oriented sentences
    const sentences = scene.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).map(s => s.trim());
  }

  private static extractCharacters(scene: string): Record<string, string> {
    // Simple extraction - would be enhanced with AI in production
    const characters: Record<string, string> = {};
    const properNouns = scene.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g) || [];

    properNouns.forEach(name => {
      if (!characters[name]) {
        characters[name] = 'Mentioned in story';
      }
    });

    return characters;
  }

  private static detectTone(scene: string): string {
    const lowerScene = scene.toLowerCase();

    if (lowerScene.includes('danger') || lowerScene.includes('attack') || lowerScene.includes('threat')) {
      return 'tense';
    } else if (lowerScene.includes('laugh') || lowerScene.includes('joke') || lowerScene.includes('amusing')) {
      return 'humorous';
    } else if (lowerScene.includes('dark') || lowerScene.includes('shadow') || lowerScene.includes('fear')) {
      return 'dark';
    } else if (lowerScene.includes('wonder') || lowerScene.includes('beautiful') || lowerScene.includes('magical')) {
      return 'whimsical';
    }

    return 'neutral';
  }

  private static condenseSummary(
    currentSummary: string,
    newScene: string,
    playerChoice?: string
  ): string {
    const addition = playerChoice
      ? `Player ${playerChoice}. ${newScene.substring(0, 100)}...`
      : newScene.substring(0, 100) + '...';

    const updated = currentSummary
      ? `${currentSummary} ${addition}`
      : addition;

    // Keep summary under 1000 characters
    return updated.length > 1000
      ? '...' + updated.substring(updated.length - 1000)
      : updated;
  }

  static saveMemory(memory: StoryMemory): void {
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY}_${memory.sessionId}`,
        JSON.stringify(memory)
      );
    } catch (error) {
      console.error('Failed to save story memory:', error);
    }
  }

  static loadMemory(sessionId: string): StoryMemory | null {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${sessionId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load story memory:', error);
      return null;
    }
  }

  static getAllMemories(): StoryMemory[] {
    const memories: StoryMemory[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_KEY)) {
        try {
          const memory = JSON.parse(localStorage.getItem(key) || '');
          memories.push(memory);
        } catch (error) {
          console.error('Failed to parse memory:', error);
        }
      }
    }

    return memories.sort((a, b) =>
      parseInt(b.sessionId.split('_')[1]) - parseInt(a.sessionId.split('_')[1])
    );
  }

  static deleteMemory(sessionId: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY}_${sessionId}`);
  }
}
