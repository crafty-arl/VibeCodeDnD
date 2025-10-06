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
    .optional()
    .describe('How clearly the outcome is presented'),
});

export type ResolutionScene = z.infer<typeof resolutionSceneSchema>;

/**
 * Schema for skill check challenge generation (future use)
 * Dynamic challenges that flow from the intro scene
 */
export const challengeSchema = z.object({
  challenge: z
    .string()
    .min(30, 'Challenge too short')
    .max(300, 'Challenge too long')
    .describe('A humorous 1-2 sentence obstacle that requires might, fortune, or cunning to overcome'),
  difficulty: z
    .enum(['easy', 'moderate', 'hard'])
    .optional()
    .describe('How difficult this challenge should be'),
  suggested_requirements: z
    .object({
      might: z.number().min(0).max(10).optional(),
      fortune: z.number().min(0).max(10).optional(),
      cunning: z.number().min(0).max(10).optional(),
    })
    .optional()
    .describe('Suggested stat requirements for this challenge'),
});

export type Challenge = z.infer<typeof challengeSchema>;
