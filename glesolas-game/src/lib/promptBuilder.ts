import type { LoreCard } from '@/types/game';
import { NarratorManager } from './narratorManager';
import { VectorizeService } from './vectorizeService';

/**
 * Prompt Builder for AI Narrative Generation
 * Constructs context-aware prompts from card data
 */

/**
 * Build a contextual prompt for intro scene generation
 * Uses card names, types, stats, and flavor text
 * Enhanced with Vectorize for semantic card context
 */
export async function buildIntroPrompt(cards: LoreCard[], availableCards?: LoreCard[]): Promise<string> {
  const [character, item, location] = cards;
  const activeDM = NarratorManager.getActiveNarrator();

  let basePrompt = `You are the DM named "${activeDM.name}" running this GLESOLAS game.

**Your DM Personality:**
- Personality: ${activeDM.personality}
- Tone: ${activeDM.tone}
- Style: ${activeDM.style}

Stay 100% in character with this personality, tone, and style throughout your narration.

Describe the opening scene (2-3 sentences) directly to YOUR player using "you" and "your".

**The Player's Cards:**
- Character: ${character.name}
  Personality: ${character.flavor}
  Stats: Might ${character.stats.might}, Fortune ${character.stats.fortune}, Cunning ${character.stats.cunning}${character.loyalty !== undefined ? `
  Companion Status: ${character.loyalty >= 100 ? 'Devoted' : character.loyalty >= 50 ? 'Loyal' : character.loyalty >= 20 ? 'Friendly' : 'Neutral'} (Loyalty: ${character.loyalty})` : ''}${character.preferredPath ? `
  Combat Style: Prefers ${character.preferredPath}` : ''}${character.encountersWon || character.encountersLost ? `
  Experience: ${character.encountersWon || 0} victories, ${character.encountersLost || 0} defeats` : ''}

- Item: ${item.name} - ${item.flavor}
  Stats: Might ${item.stats.might}, Fortune ${item.stats.fortune}, Cunning ${item.stats.cunning}

- Location: ${location.name} - ${location.flavor}
  Stats: Might ${location.stats.might}, Fortune ${location.stats.fortune}, Cunning ${location.stats.cunning}`;

  // Try to get contextually relevant cards from Vectorize
  if (availableCards && availableCards.length > 0) {
    try {
      const sceneContext = `${character.name} ${item.name} ${location.name} ${character.flavor} ${item.flavor} ${location.flavor}`;
      const relevantCards = await VectorizeService.getRelevantCardsForNarrative(
        sceneContext,
        availableCards,
        3
      );

      if (relevantCards.length > 0) {
        basePrompt += `\n\n**Thematic Context (cards available in deck):**\n${relevantCards.map(c => `- ${c.name}: ${c.flavor || ''}`).join('\n')}`;
      }
    } catch (error) {
      console.warn('⚠️ Vectorize query failed, continuing without context:', error);
    }
  }

  basePrompt += `\n\nAs the DM, tell YOUR player what THEY see and do. Use second-person: "You arrive at...", "You're holding...", "You see...". Never use third-person like "the character" or "they".`;

  return basePrompt;
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
- YOUR cards:
${cards.map(c => {
  let info = `  * ${c.name} (${c.type}): ${c.flavor}`;
  info += `\n    Stats: Might ${c.stats.might}, Fortune ${c.stats.fortune}, Cunning ${c.stats.cunning}`;
  if (c.type === 'Character' && c.loyalty !== undefined) {
    info += `\n    Companion: ${c.loyalty >= 50 ? 'Loyal' : 'Friendly'}`;
    if (c.preferredPath) info += `, prefers ${c.preferredPath}`;
  }
  return info;
}).join('\n')}

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
${cards.map(c => {
  let info = `- ${c.name} (${c.type}): ${c.flavor}`;
  info += `\n  Stats: Might ${c.stats.might}, Fortune ${c.stats.fortune}, Cunning ${c.stats.cunning}`;
  if (c.type === 'Character' && c.loyalty !== undefined) {
    const loyaltyTier = c.loyalty >= 100 ? 'Devoted' : c.loyalty >= 50 ? 'Loyal' : c.loyalty >= 20 ? 'Friendly' : 'Neutral';
    info += `\n  Companion: ${loyaltyTier}`;
    if (c.preferredPath) info += `, specializes in ${c.preferredPath}`;
    if (c.encountersWon || c.encountersLost) {
      info += `\n  Battle-tested: ${c.encountersWon || 0}W/${c.encountersLost || 0}L`;
    }
  }
  return info;
}).join('\n')}

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
${cards.map(c => {
  let info = `- ${c.name} (${c.type})`;
  info += `\n  Flavor: ${c.flavor}`;
  info += `\n  Stats: Might ${c.stats.might}, Fortune ${c.stats.fortune}, Cunning ${c.stats.cunning}`;
  if (c.type === 'Character' && c.loyalty !== undefined) {
    const loyaltyTier = c.loyalty >= 100 ? 'Devoted' : c.loyalty >= 50 ? 'Loyal' : c.loyalty >= 20 ? 'Friendly' : 'Neutral';
    info += `\n  ${loyaltyTier} Companion`;
    if (c.preferredPath) info += ` (${c.preferredPath} specialist)`;
  }
  return info;
}).join('\n')}

**CRITICAL Requirements:**
1. Challenge must be exactly 1-2 sentences (under 300 characters total)
2. Set stat requirements as INTEGER NUMBERS between 3-10
   - might_req: number between 3-10 (NOT a string)
   - fortune_req: number between 3-10 (NOT a string)
   - cunning_req: number between 3-10 (NOT a string)
3. Make requirements varied - not all equal
4. Challenge emerges naturally from the story and cards

Example output format:
{
  "challenge": "A dragon blocks your path, demanding tribute.",
  "might_req": 7,
  "fortune_req": 4,
  "cunning_req": 5
}
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

Create a brief transition (1-2 sentences, MAX 250 characters) describing what YOUR player experiences next, using "you" and "your".

**What Just Happened to the Player:**
- "${previousResolution}"
- YOU used ${pathLabels[previousPath]} and ${previousSuccess ? 'succeeded' : 'failed'}

**What YOU Face Next:**
- YOUR new cards:
${newCards.map(c => {
  let info = `  * ${c.name} (${c.type})`;
  if (c.type === 'Character' && c.loyalty !== undefined) {
    const loyaltyTier = c.loyalty >= 50 ? 'Loyal' : 'Friendly';
    info += ` - ${loyaltyTier} companion`;
    if (c.preferredPath) info += `, ${c.preferredPath} fighter`;
  }
  return info;
}).join('\n')}
- Next challenge: "${newChallenge}"

Tell the player what THEY experience as the story continues. Use second-person: "You move forward...", "Your next challenge...", "You find yourself...". Bridge the action for THEM.

**CRITICAL: Keep transition under 250 characters. Be concise.**

**IMPORTANT: Respond with ONLY valid JSON in this exact format:**
{
  "transition": "Your 1-2 sentence transition text here (MAX 250 chars)",
  "momentum": "rising" or "steady" or "falling"
}

Do not include any other text, explanations, or markdown. Only the JSON object.`;
}
