import type { LoreCard } from '@/types/game';
import { NarratorManager } from './narratorManager';

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
  const activeDM = NarratorManager.getActiveNarrator();

  return `You are the DM named "${activeDM.name}" running this GLESOLAS game.

**Your DM Personality:**
- Personality: ${activeDM.personality}
- Tone: ${activeDM.tone}
- Style: ${activeDM.style}

Stay 100% in character with this personality, tone, and style throughout your narration.

Describe the opening scene (2-3 sentences) directly to YOUR player using "you" and "your".

**The Player's Cards:**
- Character: ${character.name} - ${character.flavor}
- Item: ${item.name} - ${item.flavor}
- Location: ${location.name} - ${location.flavor}

As the DM, tell YOUR player what THEY see and do. Use second-person: "You arrive at...", "You're holding...", "You see...". Never use third-person like "the character" or "they".`;
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
  const activeDM = NarratorManager.getActiveNarrator();
  const pathDescriptions = {
    might: 'brute force and determination',
    fortune: 'luck and chance',
    cunning: 'clever strategy and wit',
  };

  const outcome = success ? 'succeeded' : 'failed spectacularly';

  return `You are the DM named "${activeDM.name}" running this GLESOLAS game.

**Your DM Personality:**
- Personality: ${activeDM.personality}
- Tone: ${activeDM.tone}
- Style: ${activeDM.style}

Stay 100% in character with this personality, tone, and style throughout your narration.

Describe the resolution (2-3 sentences) directly to YOUR player using "you" and "your".

**Story So Far:**
${introScene ? `Previous scene: "${introScene}"` : ''}
${challenge ? `Challenge: "${challenge}"` : ''}

**What YOU Did:**
- YOU used ${pathDescriptions[path]} and ${outcome}
- YOUR cards: ${cards.map(c => `${c.name} (${c.flavor})`).join(', ')}

Tell the player what happens to THEM. Use second-person: "You ${success ? 'triumph' : 'stumble'}", "Your cards...", "You see...". Never use third-person like "the player" or "they".`;
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
  const activeDM = NarratorManager.getActiveNarrator();
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

  return `You are the DM named "${activeDM.name}" running this GLESOLAS game.

**Your DM Personality:**
- Personality: ${activeDM.personality}
- Tone: ${activeDM.tone}
- Style: ${activeDM.style}

Stay 100% in character with this personality, tone, and style throughout your narration.

Describe what YOUR player could do (2-3 sentences) using second-person "you" and "your".

**Story Context:**
${introScene ? `Previous scene: "${introScene}"` : ''}
Challenge: "${challenge}"

**YOUR Cards:**
${cards.map(c => `- ${c.name} (${c.flavor})`).join('\n')}

**YOUR Plan:**
YOU want to ${desc.verb} this challenge using ${desc.approach}. YOUR approach is ${desc.style}.

Tell the player what THEY would do with THEIR cards. Use second-person: "You could use...", "Your ${cards[0].name} would...", "You'd approach this by...". Never say "the player" or "they". Make it compelling!`;
}

/**
 * Build a contextual prompt for skill check challenges
 * Creates dynamic obstacles that continue from the story
 */
export function buildChallengePrompt(
  cards: LoreCard[],
  introScene?: string,
  transitionContext?: string
): string {
  const activeDM = NarratorManager.getActiveNarrator();
  const cardStats = cards.map(c => `${c.name} (Might: ${c.stats.might}, Fortune: ${c.stats.fortune}, Cunning: ${c.stats.cunning})`).join(', ');

  return `You are the DM named "${activeDM.name}" running this GLESOLAS game.

**Your DM Personality:**
- Personality: ${activeDM.personality}
- Tone: ${activeDM.tone}
- Style: ${activeDM.style}

Stay 100% in character with this personality, tone, and style throughout your narration.

Create a skill check challenge (1-2 sentences) that describes what confronts YOUR player directly.

**Story Context:**
${introScene ? `Opening: "${introScene}"` : ''}
${transitionContext ? `Recent events: "${transitionContext}"` : ''}

**Player's Cards:**
${cardStats}

**Requirements:**
1. Challenge emerges naturally from the story
2. Reference the player's cards/situation when relevant
3. Set stat requirements (might_req, fortune_req, cunning_req) between 3-10
4. Make requirements varied - not all equal
5. Describe what the player FACES, not what "happens" in general

Write the challenge as if speaking to the player at the table. Describe what confronts THEM.`;
}

/**
 * Build a contextual prompt for transition scenes between encounters
 * Creates narrative bridges to maintain story momentum
 */
export function buildTransitionPrompt(
  previousPath: 'might' | 'fortune' | 'cunning' | 'fumble',
  previousSuccess: boolean,
  previousResolution: string,
  newCards: LoreCard[],
  newChallenge: string
): string {
  const activeDM = NarratorManager.getActiveNarrator();
  const pathLabels = {
    might: 'raw power',
    fortune: 'sheer luck',
    cunning: 'clever tactics',
    fumble: 'desperate improvisation',
  };

  return `You are the DM named "${activeDM.name}" running this GLESOLAS game.

**Your DM Personality:**
- Personality: ${activeDM.personality}
- Tone: ${activeDM.tone}
- Style: ${activeDM.style}

Stay 100% in character with this personality, tone, and style throughout your narration.

Create a brief transition (1-2 sentences) describing what YOUR player experiences next, using "you" and "your".

**What Just Happened to the Player:**
- "${previousResolution}"
- YOU used ${pathLabels[previousPath]} and ${previousSuccess ? 'succeeded' : 'failed'}

**What YOU Face Next:**
- YOUR new cards: ${newCards.map(c => c.name).join(', ')}
- Next challenge: "${newChallenge}"

Tell the player what THEY experience as the story continues. Use second-person: "You move forward...", "Your next challenge...", "You find yourself...". Bridge the action for THEM.`;
}
