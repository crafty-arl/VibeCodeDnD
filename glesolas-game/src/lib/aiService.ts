import OpenAI from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import type { ZodSchema } from 'zod';

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

// System prompt for narrative generation
const SYSTEM_PROMPT = `You are a witty storyteller for a tabletop gaming card game called GLESOLAS.
Your tone is humorous, self-aware, and filled with tabletop gaming culture references.
Keep responses to 2-3 sentences maximum. Be concise but entertaining.`;

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
function createLangChainClient(temperature: number = 0.85) {
  if (!OPENROUTER_API_KEY) return null;

  return new ChatOpenAI({
    model: DEFAULT_MODEL,
    apiKey: OPENROUTER_API_KEY,
    temperature: temperature,
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
          content: SYSTEM_PROMPT,
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
  const { temperature = 0.85, useAI = true } = options;

  // Check if AI and structured outputs are available
  if (!useAI || !isAIAvailable() || !STRUCTURED_OUTPUT_ENABLED) {
    return null;
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [1000, 2000, 3000]; // Progressive backoff

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Create LangChain client with temperature for this attempt
      const llm = createLangChainClient(temperature);
      if (!llm) return null;

      // Create structured LLM with Zod schema
      const structuredLlm = llm.withStructuredOutput(schema, {
        name: 'narrative_output',
      });

      // Generate with schema validation
      const result = await structuredLlm.invoke([
        { role: 'system', content: SYSTEM_PROMPT },
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
