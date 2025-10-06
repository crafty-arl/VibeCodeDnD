import { z } from 'zod';

/**
 * Zod Schemas for AI-Generated Narrative Content
 * Provides type-safe validation and automatic retry logic for LangChain structured outputs
 */

/**
 * Schema for intro scene generation
 * Generated at the start of each encounter with 3 random cards
 */
export const introSceneSchema = z.object({
  scene: z
    .string()
    .min(50, 'Intro scene too short')
    .max(500, 'Intro scene too long')
    .describe('A brief, humorous 2-3 sentence intro that incorporates the character, item, and location cards'),
  mood: z
    .enum(['humorous', 'dramatic', 'mysterious', 'chaotic'])
    .nullable()
    .optional()
    .describe('The overall tone of the intro scene'),
});

export type IntroScene = z.infer<typeof introSceneSchema>;

/**
 * Schema for action narrative generation
 * Shows how specific cards would be used via a particular path (might/fortune/cunning)
 */
export const actionNarrativeSchema = z.object({
  narrative: z
    .string()
    .min(50, 'Action narrative too short')
    .max(400, 'Action narrative too long')
    .describe('A compelling 2-3 sentence description of how the cards would be used via this approach'),
  confidence: z
    .enum(['high', 'medium', 'low'])
    .nullable()
    .optional()
    .describe('How likely this approach is to succeed'),
});

export type ActionNarrative = z.infer<typeof actionNarrativeSchema>;

/**
 * Schema for resolution scene generation
 * The outcome of the player's chosen action path
 */
export const resolutionSceneSchema = z.object({
  resolution: z
    .string()
    .min(50, 'Resolution too short')
    .max(500, 'Resolution too long')
    .describe('A satisfying 2-3 sentence conclusion that references the intro, challenge, and chosen path'),
  outcome_clarity: z
    .enum(['clear_success', 'clear_failure', 'ambiguous'])
    .nullable()
    .optional()
    .describe('How clearly the outcome is presented'),
});

export type ResolutionScene = z.infer<typeof resolutionSceneSchema>;

/**
 * Schema for skill check challenge generation
 * Dynamic challenges that flow from the story context
 */
export const challengeSchema = z.object({
  challenge: z
    .string()
    .min(30, 'Challenge too short')
    .max(300, 'Challenge too long')
    .describe('A humorous 1-2 sentence obstacle that flows from the story and requires might, fortune, or cunning to overcome'),
  might_req: z
    .number()
    .int()
    .min(3, 'Might requirement too low')
    .max(10, 'Might requirement too high')
    .describe('Required might stat (3-10)'),
  fortune_req: z
    .number()
    .int()
    .min(3, 'Fortune requirement too low')
    .max(10, 'Fortune requirement too high')
    .describe('Required fortune stat (3-10)'),
  cunning_req: z
    .number()
    .int()
    .min(3, 'Cunning requirement too low')
    .max(10, 'Cunning requirement too high')
    .describe('Required cunning stat (3-10)'),
});

export type Challenge = z.infer<typeof challengeSchema>;

/**
 * Schema for transition scene generation
 * Brief narrative bridge between encounters to maintain story flow
 */
export const transitionSceneSchema = z.object({
  transition: z
    .string()
    .min(30, 'Transition too short')
    .max(300, 'Transition too long')
    .describe('A quick 1-2 sentence bridge that references the previous outcome and sets up the next challenge'),
  momentum: z
    .enum(['rising', 'steady', 'falling'])
    .nullable()
    .optional()
    .describe('The story momentum heading into next encounter'),
});

export type TransitionScene = z.infer<typeof transitionSceneSchema>;

/**
 * Schema for individual card generation
 * Used for AI-powered deck generation
 */
export const cardSchema = z.object({
  name: z
    .string()
    .min(3, 'Card name too short')
    .max(50, 'Card name too long')
    .describe('A creative, thematic name for the card'),
  type: z
    .enum(['character', 'item', 'location'])
    .describe('The card type: character, item, or location'),
  flavor: z
    .string()
    .min(10, 'Flavor text too short')
    .max(200, 'Flavor text too long')
    .describe('A witty, flavorful description of the card (1-2 sentences)'),
  might: z
    .number()
    .int()
    .min(0, 'Might stat too low')
    .max(5, 'Might stat too high')
    .describe('Physical power stat (0-5)'),
  fortune: z
    .number()
    .int()
    .min(0, 'Fortune stat too low')
    .max(5, 'Fortune stat too high')
    .describe('Luck/chance stat (0-5)'),
  cunning: z
    .number()
    .int()
    .min(0, 'Cunning stat too low')
    .max(5, 'Cunning stat too high')
    .describe('Intelligence/wit stat (0-5)'),
});

export type GeneratedCard = z.infer<typeof cardSchema>;

/**
 * Schema for bulk deck generation
 * Generates a themed deck of 30-40 cards
 */
export const deckGenerationSchema = z.object({
  deckName: z
    .string()
    .min(3, 'Deck name too short')
    .max(50, 'Deck name too long')
    .describe('A creative name for the themed deck'),
  description: z
    .string()
    .min(10, 'Description too short')
    .max(200, 'Description too long')
    .describe('A brief description of the deck theme'),
  cards: z
    .array(cardSchema)
    .min(30, 'Deck must have at least 30 cards')
    .max(40, 'Deck cannot have more than 40 cards')
    .describe('Array of 30-40 thematic cards'),
});

export type GeneratedDeck = z.infer<typeof deckGenerationSchema>;
