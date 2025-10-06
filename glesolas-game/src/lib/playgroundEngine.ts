// Playground Engine - Core logic for AI-driven storytelling mode

import type { LoreCard } from '../types/game';
import type {
  NarrativePrompt,
  PlaygroundScene,
  StoryMemory,
  PlaygroundChallenge,
  ThemeOption,
} from '../types/playground';
import { generateNarrative } from './aiService';
import { StoryMemoryManager } from './storyMemory';
import { NarratorManager } from './narratorManager';

/**
 * Build a context-rich prompt for playground mode AI generation
 */
export function buildPlaygroundPrompt(
  memory: StoryMemory,
  playerInput: NarrativePrompt,
  cards: LoreCard[]
): string {
  const activeDM = NarratorManager.getActiveNarrator();

  // Base DM personality section
  let prompt = `You are "${activeDM.name}", an AI Dungeon Master co-creating a story with the player.

**DM Personality:**
${activeDM.personality}
Tone: ${activeDM.tone}
Style: ${activeDM.style}

`;

  // Add story context if available
  if (memory.narrativeSummary) {
    prompt += `**Story So Far:**
Genre: ${memory.genre}
Summary: ${memory.narrativeSummary}
Current Tone: ${memory.currentTone}
`;
  } else {
    prompt += `**Story Setup:**
Genre: ${memory.genre}
This is the beginning of a new story.
`;
  }

  // Add key events if available
  if (memory.keyEvents.length > 0) {
    prompt += `\nKey Events: ${memory.keyEvents.slice(-5).join(', ')}`;
  }

  // Add characters if available
  if (Object.keys(memory.characters).length > 0) {
    const charList = Object.entries(memory.characters)
      .slice(-5)
      .map(([name, desc]) => `- ${name}: ${desc}`)
      .join('\n');
    prompt += `\n\n**Active Characters:**\n${charList}`;
  }

  // Add current location if available
  const locations = Object.entries(memory.locations);
  if (locations.length > 0) {
    const [locName, locDesc] = locations[locations.length - 1];
    prompt += `\n\n**Current Location:** ${locName} - ${locDesc}`;
  }

  // Add themes if available
  if (memory.themes.length > 0) {
    prompt += `\n**Themes:** ${memory.themes.join(', ')}`;
  }

  // Add player's action
  prompt += `\n\n**Player's Action:**
Type: ${playerInput.type}
Action: "${playerInput.prompt}"
`;

  // Add cards if provided
  if (cards.length > 0) {
    const cardList = cards.map(c => `- ${c.name}: ${c.flavor}`).join('\n');
    prompt += `\n**Cards in Play:**\n${cardList}`;
  }

  // Task description based on prompt type
  const taskMap: Record<string, string> = {
    'scene': 'Describe the new scene the player has created',
    'character-action': 'Narrate what happens as a result of the player\'s action',
    'plot-twist': 'Introduce the plot twist the player suggested',
    'tone-shift': 'Shift the story\'s tone as requested',
    'question': 'Answer the player\'s question about the story',
  };

  prompt += `\n\n**Your Task:**
${taskMap[playerInput.type] || 'Continue the story based on the player\'s input'}.
- Maintain narrative continuity with past events
- Incorporate the cards naturally (don\'t force them)
- Match the established tone unless player shifts it
- Generate 2-4 sentences
- End with a question or narrative hook

Stay true to YOUR DM personality throughout.`;

  return prompt;
}

/**
 * Generate opening scene for quick start or theme mode
 */
export async function generateOpeningScene(
  theme: ThemeOption | null,
  cards: LoreCard[]
): Promise<{ narrative: string; memory: StoryMemory } | null> {
  const activeDM = NarratorManager.getActiveNarrator();

  const themeDescriptions: Record<ThemeOption, string> = {
    mystery: 'a mysterious puzzle or secret to uncover',
    action: 'high-stakes action and adventure',
    comedy: 'lighthearted and humorous situations',
    horror: 'dark and terrifying encounters',
    romance: 'stories of love and connection',
    epic: 'grand quests and legendary heroes',
  };

  const genre = theme || 'fantasy';
  const themeDesc = theme ? themeDescriptions[theme] : 'fantasy adventure';

  const prompt = `You are "${activeDM.name}", an AI Dungeon Master starting a new story.

**DM Personality:**
${activeDM.personality}
Tone: ${activeDM.tone}

**Story Setup:**
Genre: ${genre}
Theme: ${themeDesc}

**Starting Cards:**
${cards.map(c => `- ${c.name}: ${c.flavor}`).join('\n')}

**Your Task:**
Create an engaging opening scene (2-4 sentences) that:
- Sets up ${themeDesc}
- Incorporates the starting cards naturally
- Establishes an intriguing hook
- Ends with a question or choice for the player

Stay true to YOUR DM personality.`;

  const narrative = await generateNarrative(prompt, { maxTokens: 80, temperature: 0.85 });

  if (!narrative) return null;

  const memory = StoryMemoryManager.createInitialMemory(genre);
  memory.currentTone = theme === 'horror' ? 'dark' : theme === 'comedy' ? 'humorous' : 'neutral';

  return { narrative, memory };
}

/**
 * Process player action and generate narrative response
 */
export async function processPlayerAction(
  memory: StoryMemory,
  playerPrompt: NarrativePrompt,
  cards: LoreCard[]
): Promise<{ narrative: string; updatedMemory: StoryMemory } | null> {
  const prompt = buildPlaygroundPrompt(memory, playerPrompt, cards);
  const narrative = await generateNarrative(prompt, { maxTokens: 100, temperature: 0.85 });

  if (!narrative) return null;

  const updatedMemory = StoryMemoryManager.updateMemory(
    memory,
    narrative,
    playerPrompt.prompt
  );

  return { narrative, updatedMemory };
}

/**
 * Generate AI suggestions for scenes, characters, or plot twists
 */
export async function generateAISuggestions(
  type: 'scene' | 'character' | 'twist',
  memory: StoryMemory
): Promise<string[]> {
  const activeDM = NarratorManager.getActiveNarrator();

  const typePrompts = {
    scene: 'Generate 3 different scene ideas for what could happen next in the story',
    character: 'Generate 3 different character ideas (NPCs or new characters) that could be introduced',
    twist: 'Generate 3 different plot twist ideas that would surprise and engage the player',
  };

  const prompt = `You are "${activeDM.name}", helping the player with story ideas.

**Current Story:**
Genre: ${memory.genre}
Tone: ${memory.currentTone}
Summary: ${memory.narrativeSummary || 'Just beginning'}

**Task:** ${typePrompts[type]}

Return ONLY a numbered list (1., 2., 3.) with one brief suggestion per line (10-15 words each).`;

  const response = await generateNarrative(prompt, { maxTokens: 80, temperature: 0.9 });

  if (!response) return [];

  // Parse numbered list
  const suggestions = response
    .split('\n')
    .filter(line => /^\d+\./.test(line.trim()))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(s => s.length > 0)
    .slice(0, 3);

  return suggestions.length > 0 ? suggestions : [
    'Unable to generate suggestions at this time.',
  ];
}

/**
 * Generate narrative for plot twist injection
 */
export async function generatePlotTwist(
  memory: StoryMemory,
  cards: LoreCard[]
): Promise<string | null> {
  const activeDM = NarratorManager.getActiveNarrator();

  const prompt = `You are "${activeDM.name}", introducing a surprise plot twist.

**Current Story:**
Genre: ${memory.genre}
Summary: ${memory.narrativeSummary || 'Just beginning'}
Key Events: ${memory.keyEvents.slice(-3).join(', ')}

**Cards Available:**
${cards.map(c => `- ${c.name}`).join('\n')}

**Task:**
Create a surprising plot twist (2-3 sentences) that:
- Recontextualizes something from the story
- Creates new intrigue
- Maintains narrative coherence

Be creative but stay true to YOUR DM personality.`;

  return await generateNarrative(prompt, { maxTokens: 80, temperature: 0.9 });
}

/**
 * Generate narrative for tone shift
 */
export async function generateToneShift(
  memory: StoryMemory,
  newTone: string
): Promise<string | null> {
  const activeDM = NarratorManager.getActiveNarrator();

  const prompt = `You are "${activeDM.name}", shifting the story's tone.

**Current Story:**
Genre: ${memory.genre}
Current Tone: ${memory.currentTone}
Summary: ${memory.narrativeSummary || 'Just beginning'}

**New Tone:** ${newTone}

**Task:**
Write a transition (2-3 sentences) that shifts from the current tone to the new tone naturally.
Use events, atmosphere, or character moments to make the shift feel organic.`;

  return await generateNarrative(prompt, { maxTokens: 80, temperature: 0.85 });
}

/**
 * Create a playground scene object
 */
export function createPlaygroundScene(
  narrative: string,
  playerAction: string | undefined,
  cards: LoreCard[]
): PlaygroundScene {
  return {
    id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    narrative,
    playerAction,
    cardsUsed: cards.map(c => c.id),
    timestamp: Date.now(),
  };
}

/**
 * Generate suggested approaches for a narrative challenge
 */
export function generateSuggestedApproaches(
  narrative: string,
  _memory: StoryMemory
): PlaygroundChallenge {
  // This is a simplified version - in production, this would use AI
  // For now, generate generic approach suggestions

  const approaches = [
    {
      path: 'might' as const,
      narrative: 'Face the challenge directly with strength and courage',
    },
    {
      path: 'fortune' as const,
      narrative: 'Look for lucky breaks or opportunities',
    },
    {
      path: 'cunning' as const,
      narrative: 'Use cleverness and strategy to find a solution',
    },
  ];

  return {
    context: narrative,
    narrativeQuestion: 'How do you respond?',
    suggestedApproaches: approaches,
    allowCustomApproach: true,
  };
}

/**
 * Check if the story should naturally conclude
 */
export function shouldStoryEnd(memory: StoryMemory, sceneCount: number): boolean {
  // Story could end if:
  // - Very long (>20 scenes)
  // - Contains resolution keywords in recent events
  // - Player explicitly requests ending

  if (sceneCount > 20) return true;

  const resolutionKeywords = ['end', 'conclude', 'finish', 'finally', 'resolved', 'peace'];
  const recentEvents = memory.keyEvents.slice(-3).join(' ').toLowerCase();

  return resolutionKeywords.some(keyword => recentEvents.includes(keyword));
}

/**
 * Generate story conclusion
 */
export async function generateStoryConclusion(
  memory: StoryMemory,
  scenes: PlaygroundScene[]
): Promise<string | null> {
  const activeDM = NarratorManager.getActiveNarrator();

  const prompt = `You are "${activeDM.name}", concluding an epic story.

**Story Summary:**
Genre: ${memory.genre}
Scenes: ${scenes.length}
Key Events: ${memory.keyEvents.join(', ')}
Characters: ${Object.keys(memory.characters).join(', ')}
Themes: ${memory.themes.join(', ')}

**Task:**
Write a satisfying conclusion (3-4 sentences) that:
- Wraps up major story threads
- Reflects on the journey
- Provides emotional closure
- Stays true to YOUR DM personality

This is the final scene.`;

  return await generateNarrative(prompt, { maxTokens: 100, temperature: 0.8 });
}
