import type { LoreCard } from '@/types/game';

/**
 * Prompt Builder for AI Narrative Generation
 * Constructs context-aware prompts from card data
 */

/**
 * Build a contextual prompt for intro scene generation
 * Uses card names, types, stats, and flavor text
 */
export function buildIntroPrompt(cards: LoreCard[]): string {
  const [character, item, location] = cards;

  return `Create a brief, humorous intro scene (2-3 sentences) for a tabletop gaming story.

**Context:**
- Character: ${character.name} - ${character.flavor}
- Item: ${item.name} - ${item.flavor}
- Location: ${location.name} - ${location.flavor}

**Tone:** Self-aware tabletop gaming humor, like The Adventure Zone or Critical Role
**Style:** Witty, concise, sets up a situation without resolving it

Generate an engaging opening that naturally incorporates these three elements.`;
}

/**
 * Build a contextual prompt for resolution scenes
 * Includes player choices, outcome, and story continuity
 */
export function buildResolutionPrompt(
  cards: LoreCard[],
  path: 'might' | 'fortune' | 'cunning',
  success: boolean,
  challenge?: string,
  introScene?: string
): string {
  const pathDescriptions = {
    might: 'brute force and determination',
    fortune: 'luck and chance',
    cunning: 'clever strategy and wit',
  };

  const outcome = success ? 'succeeded' : 'failed spectacularly';

  return `Create a brief resolution (2-3 sentences) for a tabletop gaming story.

**Story So Far:**
${introScene ? `Previous scene: "${introScene}"` : ''}
${challenge ? `Challenge faced: "${challenge}"` : ''}

**What Happened:**
- The player used ${pathDescriptions[path]} and ${outcome}
- Cards played: ${cards.map(c => `${c.name} (${c.flavor})`).join(', ')}

**Tone:** ${success ? 'Triumphant but humorous' : 'Comedic failure, self-aware'}
**Style:** Continue the story from the intro scene. Reference what happened. Make it feel connected.

Generate a satisfying conclusion that flows from the previous narrative and reflects the outcome.`;
}

/**
 * Build a contextual prompt for action narrative generation
 * Shows how specific cards would be used via a particular path
 */
export function buildActionNarrativePrompt(
  cards: LoreCard[],
  path: 'might' | 'fortune' | 'cunning',
  challenge: string,
  introScene?: string
): string {
  const pathDescriptions = {
    might: {
      approach: 'brute force, physical power, and raw determination',
      style: 'aggressive, direct, forceful',
      verb: 'overpower',
    },
    fortune: {
      approach: 'luck, chance, and taking a gamble',
      style: 'risky, unpredictable, relying on dice rolls',
      verb: 'risk it all',
    },
    cunning: {
      approach: 'clever tactics, wit, and strategic thinking',
      style: 'smart, calculated, using loopholes',
      verb: 'outsmart',
    },
  };

  const desc = pathDescriptions[path];

  return `Create a brief action narrative (2-3 sentences) showing how these cards would be used via ${path.toUpperCase()}.

**Story Context:**
${introScene ? `Previous scene: "${introScene}"` : ''}
Challenge: "${challenge}"

**Cards Being Played:**
${cards.map(c => `- ${c.name} (${c.flavor})`).join('\n')}

**Approach:**
The player wants to ${desc.verb} this challenge using ${desc.approach}.

**Style:** ${desc.style}, weaves all three cards into the action, shows HOW they'd be used with this approach

Generate a compelling action description that makes the player WANT to choose this path. Make it feel like a preview of what happens if they commit to this strategy.`;
}

/**
 * Build a contextual prompt for skill check challenges
 * Creates dynamic obstacles that continue from intro scene
 */
export function buildChallengePrompt(
  cards: LoreCard[],
  introScene?: string
): string {
  return `Create a brief skill check challenge (1-2 sentences) for a tabletop gaming story.

**Story So Far:**
${introScene ? `"${introScene}"` : ''}

**Context:**
- Current situation involves: ${cards.map(c => `${c.name} (${c.flavor})`).join(', ')}

**Tone:** Humorous obstacle that fits tabletop gaming culture
**Style:** ${introScene ? 'Continue from the intro scene. What problem emerges from this situation?' : 'Sets up a problem that requires Might, Fortune, or Cunning to solve'}

Generate a challenge that naturally flows from the story setup.`;
}
