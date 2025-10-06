import OpenAI from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import type { ZodSchema } from 'zod';
import { NarratorManager } from './narratorManager';
import { deckGenerationSchema, type GeneratedDeck } from './schemas/narrativeSchemas';

/**
 * AI Service for narrative generation using OpenRouter
 * Provider: Alibaba Qwen model via OpenRouter
 * Supports both unstructured (legacy) and structured (Zod-validated) outputs
 */

// Configuration
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const AI_ENABLED = import.meta.env.VITE_AI_ENABLED !== 'false';
const STRUCTURED_OUTPUT_ENABLED = import.meta.env.VITE_AI_STRUCTURED_OUTPUT !== 'false';
const DEFAULT_MODEL = import.meta.env.VITE_AI_MODEL || 'qwen/qwen-2.5-72b-instruct';

// Get active narrator's system prompt
function getSystemPrompt(): string {
  const prompt = NarratorManager.getSystemPrompt();
  console.log('🎭 Active Narrator System Prompt:', prompt);
  return prompt;
}

// OpenRouter client (compatible with OpenAI SDK) - Legacy unstructured
const client = OPENROUTER_API_KEY
  ? new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY,
      dangerouslyAllowBrowser: true, // Client-side usage
      defaultHeaders: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GLESOLAS Game',
      },
    })
  : null;

// LangChain client factory for structured outputs
function createLangChainClient(temperature: number = 0.85, maxTokens: number = 150) {
  if (!OPENROUTER_API_KEY) return null;

  return new ChatOpenAI({
    model: DEFAULT_MODEL,
    apiKey: OPENROUTER_API_KEY,
    temperature: temperature,
    maxTokens: maxTokens, // Dynamic token limit
    timeout: 8000, // 8 second timeout (reduced from 10s)
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GLESOLAS Game',
      },
    },
  });
}

export interface AIGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  useAI?: boolean;
}

/**
 * Check if AI service is available and configured
 */
export function isAIAvailable(): boolean {
  return AI_ENABLED && client !== null && !!OPENROUTER_API_KEY;
}

/**
 * Generate narrative content using AI
 * @param prompt - The prompt to send to the AI
 * @param options - Generation options
 * @returns Generated text or null on error
 */
export async function generateNarrative(
  prompt: string,
  options: AIGenerationOptions = {}
): Promise<string | null> {
  const { maxTokens = 200, temperature = 0.8, useAI = true } = options;

  // Check if AI is available
  if (!useAI || !isAIAvailable()) {
    return null;
  }

  try {
    const response = await client!.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: temperature,
    });

    const generatedText = response.choices[0]?.message?.content?.trim();
    return generatedText || null;
  } catch (error) {
    console.error('AI generation error:', error);
    return null; // Fallback to templates on error
  }
}

/**
 * Generate structured narrative content with Zod validation
 * Includes automatic retry logic for schema validation failures
 *
 * @param prompt - The prompt to send to the AI
 * @param schema - Zod schema for validation
 * @param options - Generation options
 * @returns Validated structured output or null on error
 */
export async function generateStructured<T>(
  prompt: string,
  schema: ZodSchema<T>,
  options: AIGenerationOptions = {}
): Promise<T | null> {
  const { temperature = 0.85, maxTokens = 150, useAI = true } = options;

  // Check if AI and structured outputs are available
  if (!useAI || !isAIAvailable() || !STRUCTURED_OUTPUT_ENABLED) {
    return null;
  }

  const MAX_RETRIES = 2; // Reduced from 3 to 2 retries
  const RETRY_DELAYS = [500, 1000]; // Faster retries: 0.5s, 1s (reduced from 1s, 2s, 3s)

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Create LangChain client with temperature and token limit for this attempt
      const llm = createLangChainClient(temperature, maxTokens);
      if (!llm) return null;

      // Create structured LLM with Zod schema
      const structuredLlm = llm.withStructuredOutput(schema, {
        name: 'narrative_output',
      });

      // Generate with schema validation
      const result = await structuredLlm.invoke([
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt },
      ]);

      // LangChain already validated via Zod schema
      return result as T;
    } catch (error) {
      console.error(`Structured generation attempt ${attempt + 1} failed:`, error);

      // If this isn't the last attempt, wait before retrying
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
      }
    }
  }

  // All retries failed, return null (will fallback to templates)
  console.warn('All structured generation attempts failed, falling back to templates');
  return null;
}

/**
 * Generate a complete themed deck with AI
 * Creates 30-40 cards based on a theme
 * @param theme - The theme for the deck (e.g., "space opera", "cyberpunk", "medieval fantasy")
 * @param cardCount - Number of cards to generate (30-40)
 * @returns Generated deck or null on error
 */
export async function generateDeck(
  theme: string,
  cardCount: number = 35
): Promise<GeneratedDeck | null> {
  if (!isAIAvailable() || !STRUCTURED_OUTPUT_ENABLED) {
    return null;
  }

  // Validate card count
  if (cardCount < 30 || cardCount > 40) {
    console.error('Card count must be between 30 and 40');
    return null;
  }

  const prompt = `Generate a complete deck of ${cardCount} cards for the GLESOLAS tabletop card game.

**Theme:** ${theme}

**Requirements:**
1. Create exactly ${cardCount} cards total
2. Balanced distribution: ~${Math.floor(cardCount / 3)} characters, ~${Math.floor(cardCount / 3)} items, ~${Math.floor(cardCount / 3)} locations
3. Each card needs: name, type (character/item/location), flavor text, and stats (might, fortune, cunning from 0-5)
4. Cards should be thematically cohesive and work well together in gameplay
5. Stats should be balanced - mix of high and low stat cards
6. Flavor text should be witty and reference the theme
7. Names should be creative and memorable

**Stat Guidelines:**
- Might: Physical power, strength, combat ability
- Fortune: Luck, chance, unpredictability
- Cunning: Intelligence, wit, strategy

Generate a deck name and description that captures the ${theme} theme, then create all ${cardCount} cards.`;

  try {
    const llm = createLangChainClient(0.9, 4000); // High creativity, large token limit for bulk generation
    if (!llm) return null;

    const structuredLlm = llm.withStructuredOutput(deckGenerationSchema, {
      name: 'deck_generation',
    });

    console.log(`🎴 Generating ${cardCount} cards with theme: ${theme}`);

    const result = await structuredLlm.invoke([
      { role: 'system', content: 'You are a creative game designer for GLESOLAS, a tabletop card game with humor and wit.' },
      { role: 'user', content: prompt },
    ]);

    console.log(`✅ Generated deck: ${result.deckName} with ${result.cards.length} cards`);
    return result as GeneratedDeck;
  } catch (error) {
    console.error('Deck generation error:', error);
    return null;
  }
}

/**
 * Test AI connectivity
 * @returns true if AI is reachable and working
 */
export async function testAIConnection(): Promise<boolean> {
  if (!isAIAvailable()) return false;

  try {
    const result = await generateNarrative('Say "test" if you can hear me.', {
      maxTokens: 10,
    });
    return result !== null;
  } catch {
    return false;
  }
}
