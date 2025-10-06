import type { SkillCheck, LoreCard, SkillPath } from '@/types/game';
import { generateStructured, isAIAvailable } from '@/lib/aiService';
import { buildIntroPrompt, buildResolutionPrompt, buildActionNarrativePrompt, buildTransitionPrompt, buildChallengePrompt } from '@/lib/promptBuilder';
import {
  introSceneSchema,
  actionNarrativeSchema,
  resolutionSceneSchema,
  transitionSceneSchema,
  challengeSchema,
} from '@/lib/schemas/narrativeSchemas';

// TPG-themed intro scenes (Mad-libs style)
export const INTRO_TEMPLATES = [
  '{character} stumbled into {location}, clutching {item}. The air smelled of old pizza and destiny.',
  'At {location}, {character} discovered {item} hidden beneath a pile of character sheets.',
  '{character} rolled initiative as {location} erupted in chaos. Good thing they brought {item}.',
  'Legend tells of {character} who sought {item} in the depths of {location}. This is that legend.',
  '{character} entered {location}, {item} in hand, ready to face whatever critical failures awaited.',
];

// Skill check challenges with TPG flavor
export const CHALLENGES: SkillCheck[] = [
  {
    scene: 'A heated rules debate erupts. The table splits into factions. The GM looks exhausted.',
    requirements: { might_req: 5, fortune_req: 4, cunning_req: 7 },
  },
  {
    scene: 'The dice betray you—three nat 1s in a row. The table goes silent. The GM smiles.',
    requirements: { might_req: 3, fortune_req: 8, cunning_req: 4 },
  },
  {
    scene: 'Someone knocked over the miniatures. Chaos reigns. Initiative order is lost.',
    requirements: { might_req: 6, fortune_req: 5, cunning_req: 5 },
  },
  {
    scene: 'The pizza arrives, but there\'s pineapple on it. The party must decide: eat or starve?',
    requirements: { might_req: 4, fortune_req: 6, cunning_req: 6 },
  },
  {
    scene: 'Someone brought up "edition wars." The ancient argument awakens once more.',
    requirements: { might_req: 7, fortune_req: 3, cunning_req: 6 },
  },
  {
    scene: 'The GM asks "Are you sure?" Everyone at the table freezes in fear.',
    requirements: { might_req: 5, fortune_req: 7, cunning_req: 5 },
  },
  {
    scene: 'A player forgot their dice. A stranger offers to lend theirs. Do you trust cursed dice?',
    requirements: { might_req: 4, fortune_req: 8, cunning_req: 4 },
  },
  {
    scene: 'The campaign notes are gone. Deleted. The USB stick corrupted. Panic ensues.',
    requirements: { might_req: 6, fortune_req: 4, cunning_req: 7 },
  },
  {
    scene: 'Someone brought a bard. They want to seduce the dragon. The GM sighs deeply.',
    requirements: { might_req: 3, fortune_req: 5, cunning_req: 8 },
  },
  {
    scene: 'The rulebook has 800 pages. The answer is on exactly none of them.',
    requirements: { might_req: 4, fortune_req: 5, cunning_req: 8 },
  },
  {
    scene: 'A random encounter appears: the one player who "doesn\'t believe in social cues."',
    requirements: { might_req: 5, fortune_req: 6, cunning_req: 6 },
  },
  {
    scene: 'Your character died. Again. Time to crack open the emergency backup sheet.',
    requirements: { might_req: 7, fortune_req: 6, cunning_req: 3 },
  },
];

// Resolution templates
export const RESOLUTION_TEMPLATES = {
  might: {
    success: [
      'With raw power and determination, you flip the table—metaphorically. The challenge crumbles.',
      'You channel your inner barbarian. The problem is solved through sheer force of will.',
      'No subtlety. No grace. Pure brute-force solution. It works. Somehow.',
    ],
    fumble: [
      'You try to power through, but strength alone isn\'t enough. The dice gods mock you.',
      'Your mighty effort falls short. Sometimes muscles can\'t solve everything.',
    ],
  },
  fortune: {
    success: [
      'Against all odds, the dice favor you. A nat 20 appears. The table erupts in cheers.',
      'Pure luck carries you through. The randomness of the universe smiles upon your roll.',
      'You didn\'t plan this. You didn\'t earn this. But the dice don\'t lie—you win.',
    ],
    fumble: [
      'The dice betray you at the worst possible moment. A critical failure echoes across the table.',
      'Luck abandons you. Your roll is so bad, the GM actually looks concerned.',
    ],
  },
  cunning: {
    success: [
      'Your wit shines through. A clever loophole, a brilliant strategy—the GM nods in approval.',
      'You outsmart the challenge with tactical genius. The rules lawyer in you beams with pride.',
      'Intelligence and creativity combine. Your solution is so elegant, the table applauds.',
    ],
    fumble: [
      'Your clever plan has one fatal flaw: it doesn\'t work. The GM chuckles darkly.',
      'Overthinking costs you. Sometimes the simple solution is the right one.',
    ],
  },
};

/**
 * Generate intro scene (template fallback for sync usage)
 * @deprecated Use generateIntroSceneAsync for AI-powered narratives
 */
export function generateIntroScene(cards: LoreCard[]): string {
  const [character, item, location] = cards;
  const template = INTRO_TEMPLATES[Math.floor(Math.random() * INTRO_TEMPLATES.length)];

  return template
    .replace('{character}', character.name)
    .replace('{item}', item.name)
    .replace('{location}', location.name);
}

/**
 * Generate intro scene with AI (async)
 * Uses structured output with Zod validation, falls back to template on failure
 */
export async function generateIntroSceneAsync(
  cards: LoreCard[],
  useAI: boolean = true,
  availableCards?: LoreCard[]
): Promise<string> {
  console.log('🎬 generateIntroSceneAsync called', { useAI, isAIAvailable: isAIAvailable(), cardsCount: cards.length });

  // Attempt structured AI generation if enabled and available
  if (useAI && isAIAvailable()) {
    console.log('🔨 Building intro prompt...');
    const prompt = await buildIntroPrompt(cards, availableCards);
    console.log('📝 Prompt built, length:', prompt.length);

    // Try structured output (with Zod validation)
    const structuredResult = await generateStructured(prompt, introSceneSchema, {
      maxTokens: 150, // Enough for complete JSON response
      temperature: 0.7, // Moderate creativity for better JSON compliance
    });

    if (structuredResult) {
      console.log('✨ Structured result received');
      return structuredResult.scene;
    }
    console.log('⚠️ Structured generation returned null, falling back to template');
    // Fall through to template if structured fails (faster than double-fallback)
  }

  // Final fallback to template-based generation
  console.log('📋 Using template fallback');
  const fallbackScene = generateIntroScene(cards);
  return fallbackScene;
}

export function getRandomChallenge(): SkillCheck {
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
}

/**
 * Generate resolution scene (template fallback for sync usage)
 * @deprecated Use generateResolutionSceneAsync for AI-powered narratives
 */
export function generateResolutionScene(path: SkillPath, success: boolean): string {
  const templates = RESOLUTION_TEMPLATES[path];
  const pool = success ? templates.success : templates.fumble;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generate resolution scene with AI (async)
 * Uses structured output with Zod validation, falls back to template on failure
 */
export async function generateResolutionSceneAsync(
  cards: LoreCard[],
  path: SkillPath,
  success: boolean,
  challenge?: string,
  introScene?: string,
  useAI: boolean = true
): Promise<string> {
  // Attempt structured AI generation if enabled and available
  if (useAI && isAIAvailable()) {
    const prompt = buildResolutionPrompt(cards, path, success, challenge, introScene);

    // Try structured output (with Zod validation)
    const structuredResult = await generateStructured(prompt, resolutionSceneSchema, {
      maxTokens: 120, // Reduced from 250 - resolutions are 2-3 sentences
      temperature: 0.85, // High creativity for resolutions
    });

    if (structuredResult) {
      return structuredResult.resolution;
    }
    // Fall through to template if structured fails (faster than double-fallback)
  }

  // Final fallback to template-based generation
  const fallbackScene = generateResolutionScene(path, success);
  return fallbackScene;
}

/**
 * Generate action narrative showing how cards would be used via specific path
 * Uses structured output with Zod validation, falls back to template on failure
 */
export async function generateActionNarrativeAsync(
  cards: LoreCard[],
  path: SkillPath,
  challenge: string,
  introScene?: string,
  useAI: boolean = true
): Promise<string> {
  // Attempt structured AI generation if enabled and available
  if (useAI && isAIAvailable()) {
    const prompt = buildActionNarrativePrompt(cards, path, challenge, introScene);

    // Try structured output (with Zod validation)
    const structuredResult = await generateStructured(prompt, actionNarrativeSchema, {
      maxTokens: 100, // Reduced from 200 - action narratives are 2-3 sentences
      temperature: 0.88, // High creativity for action previews
    });

    if (structuredResult) {
      return structuredResult.narrative;
    }
    // Fall through to template if structured fails (faster than double-fallback)
  }

  // Final fallback to simple template
  const pathVerbs = {
    might: 'use brute force',
    fortune: 'take a gamble',
    cunning: 'outsmart the situation',
  };

  return `You could ${pathVerbs[path]} using ${cards.map(c => c.name).join(', ')}.`;
}

/**
 * Generate transition scene with AI (async)
 * Creates narrative bridges between encounters to maintain story momentum
 * Uses structured output with Zod validation, falls back to template on failure
 */
export async function generateTransitionAsync(
  previousPath: SkillPath | 'fumble',
  previousSuccess: boolean,
  previousResolution: string,
  newCards: LoreCard[],
  newChallenge: string,
  useAI: boolean = true
): Promise<string> {
  // Attempt structured AI generation if enabled and available
  if (useAI && isAIAvailable()) {
    const prompt = buildTransitionPrompt(
      previousPath,
      previousSuccess,
      previousResolution,
      newCards,
      newChallenge
    );

    // Try structured output (with Zod validation)
    const structuredResult = await generateStructured(prompt, transitionSceneSchema, {
      maxTokens: 80, // Reduced from 150 - transitions are 1-2 sentences
      temperature: 0.88, // High creativity for momentum
    });

    if (structuredResult) {
      return structuredResult.transition;
    }
    // Fall through to template if structured fails (faster than double-fallback)
  }

  // Final fallback to simple template
  const outcomeText = previousSuccess ? 'victory in hand' : 'lessons learned';
  return `With ${outcomeText}, the adventure continues as ${newCards.map(c => c.name).join(', ')} enter the scene.`;
}

/**
 * Generate contextual skill check challenge with AI (async)
 * Creates challenges that flow from the current story
 * Uses structured output with Zod validation, falls back to random challenge on failure
 */
export async function generateChallengeAsync(
  cards: LoreCard[],
  introScene?: string,
  transitionContext?: string,
  useAI: boolean = true
): Promise<SkillCheck> {
  // Attempt structured AI generation if enabled and available
  if (useAI && isAIAvailable()) {
    const prompt = buildChallengePrompt(cards, introScene, transitionContext);

    // Try structured output first (with Zod validation)
    const structuredResult = await generateStructured(prompt, challengeSchema, {
      maxTokens: 150, // Increased to ensure complete response
      temperature: 0.7, // Lower temperature for better format compliance
    });

    if (structuredResult) {
      return {
        scene: structuredResult.challenge,
        requirements: {
          might_req: structuredResult.might_req,
          fortune_req: structuredResult.fortune_req,
          cunning_req: structuredResult.cunning_req,
        },
      };
    }
  }

  // Final fallback to random challenge from static list
  const fallbackChallenge = getRandomChallenge();
  return fallbackChallenge;
}
