import OpenAI from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import { jsonrepair } from 'jsonrepair';
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
function createLangChainClient(temperature: number = 0.85, maxTokens: number = 80) {
  if (!OPENROUTER_API_KEY) return null;

  return new ChatOpenAI({
    model: DEFAULT_MODEL,
    apiKey: OPENROUTER_API_KEY,
    temperature: temperature,
    maxTokens: maxTokens, // Dynamic token limit - reduced for faster generation
    timeout: 6000, // 6 second timeout for faster failures
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
 * Helper function to extract schema shape from Zod for examples
 */
function getSchemaExample(schema: ZodSchema<any>): Record<string, any> {
  const schemaDef = (schema as any)._def;

  if (schemaDef?.typeName === 'ZodObject') {
    const shape = schemaDef.shape();
    const example: Record<string, any> = {};

    for (const [key, value] of Object.entries(shape)) {
      const fieldDef = (value as any)._def;

      // Get description if available
      const description = fieldDef?.description || '';

      // Determine example value based on type
      if (fieldDef?.typeName === 'ZodString') {
        example[key] = `<string: ${description || key}>`;
      } else if (fieldDef?.typeName === 'ZodNumber') {
        example[key] = 0;
      } else if (fieldDef?.typeName === 'ZodBoolean') {
        example[key] = true;
      } else if (fieldDef?.typeName === 'ZodEnum') {
        const values = fieldDef?.values || [];
        example[key] = values[0] || 'value';
      } else {
        example[key] = null;
      }
    }

    return example;
  }

  return {};
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
  const { maxTokens = 80, temperature = 0.8, useAI = true } = options;

  console.log('🎯 generateNarrative called', { useAI, isAIAvailable: isAIAvailable(), maxTokens });

  // Check if AI is available
  if (!useAI || !isAIAvailable()) {
    console.log('⚠️ AI not available, returning null');
    return null;
  }

  try {
    console.log('📡 Sending request to OpenRouter...', { model: DEFAULT_MODEL, maxTokens, temperature });
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
    console.log('✅ AI response received:', generatedText ? `${generatedText.substring(0, 50)}...` : 'EMPTY');
    return generatedText || null;
  } catch (error) {
    console.error('❌ AI generation error:', error);
    return null; // Fallback to templates on error
  }
}

/**
 * Generate structured narrative content with Zod validation using LangChain
 * Uses proper withStructuredOutput() method as recommended by LangChain docs
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

  console.log('🎯 generateStructured called', {
    useAI,
    isAIAvailable: isAIAvailable(),
    structuredEnabled: STRUCTURED_OUTPUT_ENABLED,
    maxTokens
  });

  // Check if AI and structured outputs are available
  if (!useAI || !isAIAvailable() || !STRUCTURED_OUTPUT_ENABLED) {
    console.log('⚠️ Structured AI not available, returning null');
    return null;
  }

  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let generatedText: string | undefined;

    try {
      console.log(`📡 Structured generation attempt ${attempt + 1}/${MAX_RETRIES}...`);

      // Generate schema example
      const schemaExample = getSchemaExample(schema);
      const exampleJson = JSON.stringify(schemaExample, null, 2);

      // OpenRouter doesn't support function calling for all models
      // Use JSON mode with explicit schema in prompt
      const response = await client!.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: getSystemPrompt() + '\n\n**CRITICAL INSTRUCTIONS:**\n- You MUST respond with ONLY valid JSON\n- No markdown code blocks\n- No explanations or additional text\n- ALL fields in the schema are REQUIRED - do not omit any field',
          },
          {
            role: 'user',
            content: `${prompt}\n\n**REQUIRED JSON SCHEMA:**
You MUST return a JSON object matching this EXACT structure. All fields are REQUIRED:

\`\`\`json
${exampleJson}
\`\`\`

**CRITICAL RULES:**
- Every field in the schema MUST be present in your response
- String fields must have actual content (not placeholders)
- Number fields must be actual numbers (not strings)
- Do NOT add extra fields not in the schema
- Response must be valid, parseable JSON

Return ONLY the JSON object now:`,
          },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        response_format: { type: 'json_object' }, // Force JSON mode
      });

      generatedText = response.choices[0]?.message?.content?.trim();
      console.log('📥 Raw AI response:', generatedText?.substring(0, 200));

      if (!generatedText) {
        throw new Error('Empty response from AI');
      }

      // Clean and parse the response
      let jsonText = generatedText;

      // Remove markdown code blocks if present
      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      // Use jsonrepair to fix common JSON issues (unterminated strings, missing commas, etc.)
      console.log('🔧 Repairing JSON...');
      const repairedJson = jsonrepair(jsonText);

      // Parse and validate with Zod
      const parsed = JSON.parse(repairedJson);
      const validated = schema.parse(parsed);

      console.log('✅ Structured AI response received and validated');
      return validated as T;
    } catch (error) {
      console.error(`❌ Structured generation attempt ${attempt + 1} failed:`, error);

      // If we have a response but it failed validation, try AI self-correction
      if (generatedText && error instanceof Error && attempt < MAX_RETRIES - 1) {
        console.log('🔧 Asking AI to fix the errors...');
        try {
          const schemaExample = getSchemaExample(schema);
          const exampleJson = JSON.stringify(schemaExample, null, 2);

          const fixResponse = await client!.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
              {
                role: 'system',
                content: 'You are a JSON repair expert. Fix the broken JSON to exactly match the required schema.',
              },
              {
                role: 'user',
                content: `**BROKEN JSON:**
\`\`\`json
${generatedText}
\`\`\`

**ERROR:**
${error.message}

**REQUIRED SCHEMA (ALL FIELDS REQUIRED):**
\`\`\`json
${exampleJson}
\`\`\`

**FIX INSTRUCTIONS:**
1. Add ANY missing required fields from the schema
2. Ensure all strings are properly quoted and terminated
3. All numeric fields must be actual numbers (not strings)
4. Remove any extra fields not in schema
5. Keep string content under character limits

Return ONLY the corrected JSON object:`,
              },
            ],
            max_tokens: maxTokens,
            temperature: 0.3, // Lower temperature for corrections
            response_format: { type: 'json_object' },
          });

          const fixedText = fixResponse.choices[0]?.message?.content?.trim();
          if (fixedText) {
            const repairedFixed = jsonrepair(fixedText);
            const fixedParsed = JSON.parse(repairedFixed);
            const fixedValidated = schema.parse(fixedParsed);
            console.log('✅ AI successfully fixed the errors!');
            return fixedValidated as T;
          }
        } catch (fixError) {
          console.error('❌ AI fix attempt failed:', fixError);
        }
      }

      // If this isn't the last attempt, wait before retrying
      if (attempt < MAX_RETRIES - 1) {
        console.log(`⏳ Retrying in ${500 * (attempt + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }

  // All retries failed, return null (will fallback to templates)
  console.warn('⚠️ All structured generation attempts failed, falling back to templates');
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
