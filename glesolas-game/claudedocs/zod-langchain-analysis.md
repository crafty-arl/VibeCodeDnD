# Zod + LangChain Schema Reinforcement Analysis

**Date**: 2025-10-05
**Status**: Strategic Planning (Pre-Implementation)
**Scope**: AI-generated content validation for GLESOLAS game

---

## Executive Summary

**Objective**: Add Zod schema validation + LangChain structured output parsing to AI-generated narrative content with retry logic, BEFORE implementing skill check generation.

**Current State**: No validation - we accept raw text from OpenRouter (Alibaba Qwen 2.5 72B) without structure enforcement or error handling.

**Proposed Solution**: LEAN implementation using LangChain.js `.withStructuredOutput()` method with Zod schemas, minimal retry logic (1-2 attempts), fallback to templates.

**Risk Assessment**: LOW - Changes isolated to `src/lib/aiService.ts`, non-breaking, graceful degradation.

**Token/Cost Impact**: MINIMAL - Retry logic adds <5% overhead, schema validation reduces invalid responses.

---

## Current Architecture Analysis

### AI Integration Points (src/lib/aiService.ts)
```typescript
// Current implementation: Raw text generation
export async function generateNarrative(
  prompt: string,
  options: AIGenerationOptions = {}
): Promise<string | null>
```

**Problem**: Returns `string | null` with no structure validation. Invalid format = silent failure → fallback to templates.

### AI Consumers (src/data/scenes.ts)
1. `generateIntroSceneAsync()` - Character/item/location intro (2-3 sentences)
2. `generateResolutionSceneAsync()` - Success/failure outcomes (2-3 sentences)
3. `generateActionNarrativeAsync()` - Path-specific action previews (2-3 sentences)
4. `buildChallengePrompt()` - FUTURE: Skill check generation (not yet implemented)

**Current Flow**: Prompt → AI → Raw text → Template fallback if null

**Proposed Flow**: Prompt → AI + Schema → Validated object → Retry if invalid → Template fallback

---

## LangChain Best Practices (Context7 Research)

### Recommended Pattern: `.withStructuredOutput()`
```typescript
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

const schema = z.object({
  content: z.string().describe("The narrative text"),
  tone: z.enum(["humorous", "dramatic", "neutral"]).optional(),
});

const structuredLlm = llm.withStructuredOutput(schema, { name: "narrative" });
const result = await structuredLlm.invoke(prompt); // Returns validated object
```

**Why This Works**:
- Uses function calling under the hood (supported by most LLMs)
- Automatic JSON schema conversion from Zod
- Built-in parsing + validation
- Simpler than `StructuredOutputParser` (no manual prompt injection)

### Alternative Pattern: StructuredOutputParser (NOT RECOMMENDED)
```typescript
import { StructuredOutputParser } from "@langchain/core/output_parsers";

const parser = StructuredOutputParser.fromZodSchema(schema);
const formatInstructions = parser.getFormatInstructions(); // Must inject into prompt
const chain = prompt.pipe(model).pipe(parser);
```

**Why We WON'T Use This**:
- Requires manual prompt modification (adds "respond in JSON format..." instructions)
- More error-prone (depends on LLM following instructions)
- Older pattern, replaced by `.withStructuredOutput()`

---

## Proposed Implementation Strategy

### Phase 1: Dependencies
```bash
npm install @langchain/openai @langchain/core zod
```

**Already Have**: `zod` (if not, add it)
**New Packages**: `@langchain/openai`, `@langchain/core`

**Size Impact**: ~500KB compressed (acceptable for this feature)

### Phase 2: Zod Schemas (New File)

**File**: `src/lib/schemas/narrativeSchemas.ts`

```typescript
import { z } from "zod";

// Intro scene schema
export const introSceneSchema = z.object({
  scene: z.string()
    .min(50)
    .max(500)
    .describe("The intro scene narrative (2-3 sentences)"),
  mood: z.enum(["humorous", "dramatic", "mysterious", "chaotic"])
    .optional()
    .describe("The overall mood/tone"),
});

// Action narrative schema
export const actionNarrativeSchema = z.object({
  narrative: z.string()
    .min(50)
    .max(400)
    .describe("How cards would be used via this path (2-3 sentences)"),
  confidence: z.enum(["high", "medium", "low"])
    .optional()
    .describe("How viable this path seems"),
});

// Resolution scene schema
export const resolutionSceneSchema = z.object({
  resolution: z.string()
    .min(50)
    .max(500)
    .describe("The resolution narrative (2-3 sentences)"),
  outcome_clarity: z.enum(["clear_success", "clear_failure", "ambiguous"])
    .optional(),
});

// Challenge/skill check schema (future)
export const challengeSchema = z.object({
  challenge: z.string()
    .min(30)
    .max(300)
    .describe("The skill check challenge (1-2 sentences)"),
  difficulty: z.enum(["easy", "moderate", "hard"])
    .optional(),
});

export type IntroScene = z.infer<typeof introSceneSchema>;
export type ActionNarrative = z.infer<typeof actionNarrativeSchema>;
export type ResolutionScene = z.infer<typeof resolutionSceneSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
```

**Design Rationale**:
- **Minimal fields**: 1 required field (the text), optional metadata
- **Length validation**: Prevents runaway generation (cost control)
- **Descriptive**: `.describe()` gives LLM context for better generation
- **Type safety**: `z.infer<>` creates TypeScript types automatically

### Phase 3: LangChain Integration (Modify aiService.ts)

**Current**:
```typescript
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});
```

**Proposed**:
```typescript
import { ChatOpenAI } from "@langchain/openai";
import type { z } from "zod";

// LangChain client (wraps OpenAI SDK, works with OpenRouter)
const langchainClient = OPENROUTER_API_KEY
  ? new ChatOpenAI({
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: OPENROUTER_API_KEY,
      },
      model: DEFAULT_MODEL,
      temperature: 0.8,
    })
  : null;

// Generic structured generation with retry
async function generateStructured<T extends z.ZodType>(
  prompt: string,
  schema: T,
  schemaName: string,
  options: {
    maxRetries?: number;
    temperature?: number;
  } = {}
): Promise<z.infer<T> | null> {
  const { maxRetries = 2, temperature = 0.8 } = options;

  if (!langchainClient) return null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const structuredLlm = langchainClient.withStructuredOutput(schema, {
        name: schemaName,
      });

      const result = await structuredLlm.invoke([
        {
          role: "system",
          content: `You are a witty storyteller for GLESOLAS, a tabletop gaming card game.
Your tone is humorous, self-aware, and filled with tabletop culture references.
Keep responses concise but entertaining.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ]);

      return result; // Already validated by Zod
    } catch (error) {
      console.warn(`Structured generation attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries - 1) {
        console.error("All structured generation attempts failed");
        return null; // Fallback to templates
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return null;
}
```

**Why This Works**:
- **Generic**: Works with any Zod schema (reusable)
- **Retry logic**: 2 attempts max (1000ms, 2000ms backoff)
- **Type-safe**: Returns `z.infer<T> | null`
- **Graceful degradation**: Returns null → existing fallback logic handles it

### Phase 4: Update Scene Generators (Modify scenes.ts)

**Before**:
```typescript
export async function generateIntroSceneAsync(
  cards: LoreCard[],
  useAI: boolean = true
): Promise<string> {
  if (useAI && isAIAvailable()) {
    const prompt = buildIntroPrompt(cards);
    const aiScene = await generateNarrative(prompt, {
      maxTokens: 150,
      temperature: 0.9,
    });
    if (aiScene) return aiScene;
  }
  return generateIntroScene(cards); // Template fallback
}
```

**After**:
```typescript
import { generateStructuredIntroScene } from '@/lib/aiService';

export async function generateIntroSceneAsync(
  cards: LoreCard[],
  useAI: boolean = true
): Promise<string> {
  if (useAI && isAIAvailable()) {
    const prompt = buildIntroPrompt(cards);
    const result = await generateStructuredIntroScene(prompt);

    if (result) {
      // Extract just the scene text (validated by schema)
      return result.scene;
    }
  }
  return generateIntroScene(cards); // Template fallback
}
```

**Specific Service Functions** (Add to aiService.ts):
```typescript
export async function generateStructuredIntroScene(prompt: string) {
  return generateStructured(prompt, introSceneSchema, "intro_scene", {
    temperature: 0.9,
  });
}

export async function generateStructuredActionNarrative(prompt: string) {
  return generateStructured(prompt, actionNarrativeSchema, "action_narrative", {
    temperature: 0.88,
  });
}

export async function generateStructuredResolution(prompt: string) {
  return generateStructured(prompt, resolutionSceneSchema, "resolution_scene", {
    temperature: 0.85,
  });
}

// Future: Skill check generation
export async function generateStructuredChallenge(prompt: string) {
  return generateStructured(prompt, challengeSchema, "challenge", {
    temperature: 0.85,
  });
}
```

---

## Files Modified (Implementation Checklist)

### New Files
- `src/lib/schemas/narrativeSchemas.ts` - Zod schemas + types

### Modified Files
- `package.json` - Add LangChain dependencies
- `src/lib/aiService.ts` - Add LangChain client + structured generation
- `src/data/scenes.ts` - Update async generators to use structured outputs

### Unchanged Files
- `src/lib/promptBuilder.ts` - Prompts stay the same (no manual format instructions needed)
- `src/types/game.ts` - No type changes (scene generators still return `string`)
- `src/App.tsx` - No UI changes

---

## Retry Logic Design

### Strategy: Conservative Retry with Exponential Backoff

**Max Retries**: 2 (total 3 attempts including initial)
**Backoff**: 1s → 2s
**Failure Handling**: Return `null` → existing template fallback

**Why This Works**:
- **Cost-effective**: Most LLMs succeed on first attempt with schema
- **Fast failure**: Max 3s delay before fallback
- **Non-blocking**: Doesn't freeze UI (async)

**When Retries Trigger**:
- Zod validation error (malformed JSON, wrong types)
- Network timeout (LangChain default: 60s)
- API rate limit (429 error)

**When Retries DON'T Trigger**:
- Template fallback (null result is valid)
- AI disabled (bypasses AI entirely)

---

## Token/Cost Impact Analysis

### Current Costs (per generation)
- Intro scene: ~150 tokens output
- Action narrative: ~200 tokens output
- Resolution: ~250 tokens output

### Schema Overhead
- Function calling metadata: +20-50 tokens per request
- Retry on failure: +100% cost (max 2 retries = 3x total)

### Expected Reality
- **Success rate with schema**: 95%+ on first attempt
- **Average overhead**: <10% (schema metadata only)
- **Worst case**: 3x cost on 5% of requests = 15% overall increase
- **Best case**: LOWER costs (fewer invalid responses, no wasted tokens)

**Net Impact**: +5-10% token usage, ACCEPTABLE for quality improvement

---

## Risk Assessment

### Low Risks ✅
- **Non-breaking changes**: Existing templates still work
- **Isolated scope**: Only touches `aiService.ts` + `scenes.ts`
- **Graceful degradation**: Falls back to templates on any error
- **Type safety**: Zod + TypeScript prevent runtime errors

### Medium Risks ⚠️
- **LangChain compatibility with OpenRouter**: Needs testing (OpenAI SDK works, LangChain wraps it)
- **Model support for function calling**: Qwen 2.5 72B should support it, verify with test
- **Bundle size**: +500KB (acceptable, but monitor)

### Mitigation Strategies
1. **Test OpenRouter compatibility** FIRST with simple schema
2. **Feature flag**: Add `VITE_AI_STRUCTURED_OUTPUT=true` to enable/disable
3. **Fallback chain**: Structured → Unstructured → Template
4. **Monitoring**: Log schema validation failures for analysis

---

## Implementation Plan (Step-by-Step)

### Step 1: Add Dependencies
```bash
npm install @langchain/openai @langchain/core
# zod already exists (check package.json)
```

### Step 2: Create Schemas File
Create `src/lib/schemas/narrativeSchemas.ts` with all 4 schemas (intro, action, resolution, challenge)

### Step 3: Test LangChain + OpenRouter
Add test function to `aiService.ts`:
```typescript
export async function testStructuredOutput(): Promise<boolean> {
  const testSchema = z.object({ test: z.string() });
  const result = await generateStructured(
    "Say hello",
    testSchema,
    "test",
    { maxRetries: 1 }
  );
  return result !== null;
}
```

Call from UI (temporary button) to verify compatibility.

### Step 4: Implement Generic `generateStructured()`
Add to `aiService.ts` with retry logic + error handling

### Step 5: Add Specific Service Functions
`generateStructuredIntroScene()`, `generateStructuredActionNarrative()`, etc.

### Step 6: Update Scene Generators
Modify `scenes.ts` to call new structured functions

### Step 7: Test + Validate
- Generate intro scenes with various card combinations
- Verify schema validation catches malformed responses
- Confirm fallback to templates works
- Check token usage in OpenRouter dashboard

### Step 8: Future-Proof for Skill Checks
`generateStructuredChallenge()` is ready to use when skill check generation is implemented

---

## Extensibility: Future AI Features

This architecture supports:

1. **Dynamic Skill Checks**: `challengeSchema` ready to use
2. **Multi-turn Dialogues**: Chain multiple structured outputs
3. **Character Descriptions**: Add `characterSchema` for NPC generation
4. **Combat Narratives**: Add `combatSchema` for battle descriptions
5. **Lore Expansion**: Add `loreSchema` for world-building content

**Pattern**: Define schema → Add service function → Update consumer

---

## Decision Points for User

### Question 1: LangChain vs. Manual Retry
- **LangChain**: Standardized, well-tested, future-proof
- **Manual**: Custom retry logic, no new dependencies

**Recommendation**: LangChain (industry standard, less code to maintain)

### Question 2: How Many Retries?
- **1 retry** (2 total attempts): Fast failure, lower cost
- **2 retries** (3 total attempts): Better reliability, slightly higher cost

**Recommendation**: 2 retries (95%+ success rate worth the <5% cost increase)

### Question 3: Schema Complexity
- **Minimal** (1 required field): Fastest, least validation
- **Moderate** (1 required + optional metadata): Balanced
- **Rich** (multiple required fields): Slower, stricter

**Recommendation**: Moderate (proposed schemas have 1 required + 1-2 optional)

### Question 4: Feature Flag?
- **Yes**: Add `VITE_AI_STRUCTURED_OUTPUT=true` to toggle new behavior
- **No**: Enable for everyone immediately

**Recommendation**: YES for initial rollout, remove after 1 week of testing

---

## Success Metrics

### Technical Metrics
- Schema validation success rate: >90%
- Retry rate: <10%
- Template fallback rate: <5%
- Token overhead: <15%

### Quality Metrics
- Narrative length consistency: ±20% of target
- Tone alignment: Manual review (sample 20 outputs)
- User-reported issues: 0 (silent improvement)

---

## Conclusion

**Go/No-Go Recommendation**: GO

**Rationale**:
- Low risk, high value
- Minimal code changes (2 files modified, 1 file added)
- Non-breaking (graceful degradation)
- Future-proof (extensible for skill checks + more)
- Industry-standard approach (LangChain + Zod)

**Estimated Implementation Time**: 2-3 hours (including testing)

**Next Steps**:
1. User approval of this plan
2. Add dependencies
3. Create schemas file
4. Test OpenRouter compatibility
5. Implement + test

**Blocker Check**: NONE identified. Ready to proceed.
