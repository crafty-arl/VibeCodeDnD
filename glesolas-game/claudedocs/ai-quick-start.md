# AI Integration - Quick Start Guide
**TL;DR**: Replace templated intro scenes with AI-generated narratives

---

## The Smart Spot: Intro Scene Generation

### Current State
```typescript
// src/data/scenes.ts
export function generateIntroScene(cards: LoreCard[]): string {
  const template = INTRO_TEMPLATES[Math.floor(Math.random() * 5)];
  return template
    .replace('{character}', character.name)
    .replace('{item}', item.name)
    .replace('{location}', location.name);
}
```

**Problem**: Only 5 templates = repetitive after 10 plays

---

### Target State
```typescript
// src/data/scenes.ts (AI-powered)
export async function generateIntroScene(
  cards: LoreCard[],
  useAI: boolean = true
): Promise<string> {
  if (!useAI) return generateTemplateScene(cards);

  const prompt = `Create a 2-sentence TPG-themed intro scene using:
  - Character: ${cards[0].name} (${cards[0].flavor})
  - Item: ${cards[1].name} (${cards[1].flavor})
  - Location: ${cards[2].name} (${cards[2].flavor})

  Style: Humorous tabletop gaming references, 40-60 words.`;

  try {
    const scene = await callAI(prompt);
    return scene || generateTemplateScene(cards); // Fallback
  } catch {
    return generateTemplateScene(cards); // Fallback
  }
}
```

**Solution**: Unique narratives using card flavor text + AI creativity

---

## Why This Spot?

### ✅ Low Risk
- Single function change
- Easy rollback (fallback to templates)
- No game mechanics affected
- Client-side only (no backend)

### ✅ High Impact
- First impression every session
- Uses existing card flavor text
- Infinite variety
- Foundation for future AI features

### ✅ Focused Scope
- **Files to change**: 3 files total
- **New dependencies**: 1 AI SDK
- **Implementation time**: 2 weeks
- **Cost**: <$0.01 per session

---

## 3-Step Implementation

### Step 1: Setup (Day 1-2)
```bash
# Install AI SDK
npm install openai  # Works with OpenRouter

# Create AI service
touch src/lib/aiService.ts

# Add environment variable
echo "VITE_OPENROUTER_API_KEY=your_key_here" > .env
```

### Step 2: Integrate (Day 3-7)
```typescript
// src/lib/aiService.ts
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateNarrative(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "anthropic/claude-3-haiku",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150
  });
  return response.choices[0].message.content || "";
}
```

### Step 3: Polish (Day 8-14)
- Add loading spinner to intro phase
- Test with 20+ card combinations
- Implement rate limiting (3 AI calls per session)
- Optimize token usage
- Add content safety checks

---

## File Changes Checklist

### New Files
- [ ] `src/lib/aiService.ts` - AI client wrapper
- [ ] `src/lib/promptBuilder.ts` - Card data → prompt logic
- [ ] `.env` - API key configuration

### Modified Files
- [ ] `src/data/scenes.ts` - Make generateIntroScene async
- [ ] `src/App.tsx` - Add loading state for intro phase
- [ ] `package.json` - Add `openai` dependency

### Unchanged (Critical)
- ❌ `src/lib/gameEngine.ts` - Do NOT touch game logic
- ❌ `src/data/cards.ts` - Do NOT change card data
- ❌ Game mechanics - Do NOT alter stat calculations

---

## Success Criteria

**Ship when ALL are true**:
- [ ] Intro scenes are unique across 20 sessions
- [ ] Fallback works offline/on error
- [ ] Load time <2 seconds
- [ ] Cost <$0.01 per session
- [ ] No game-breaking bugs
- [ ] Player feedback >4/5

**Do NOT ship if**:
- AI responses break game flow
- Latency >3 seconds
- Cost >$0.05 per session
- Any template fallback failures

---

## Cost Estimate

**Using Claude Haiku via OpenRouter**:
- Model: `anthropic/claude-3-haiku` ($0.25 per 1M input tokens)
- Prompt: ~100 tokens
- Response: ~100 tokens
- Cost per scene: **$0.00005** (half a cent)

**Monthly costs (1000 active users)**:
- 5 sessions per user = 5000 intro scenes
- 5000 × $0.00005 = **$0.25/month**

**Negligible cost, massive value.**

---

## Scope Boundaries (DO NOT CROSS)

### In Scope ✅
- Intro scene AI generation
- Loading state for AI calls
- Fallback to templates
- Prompt optimization

### Out of Scope ❌
- Backend API server
- User authentication
- Skill check AI generation (Phase 2B)
- Resolution scene AI (Phase 2A)
- Database integration
- Multi-user features

**If someone suggests these, say NO and finish intro scenes first.**

---

## Next AI Features (After Intro Success)

### Phase 2A: Resolution Scenes
- Use same AI service
- Reflect player's card choices
- Reference chosen skill path
- 2-week implementation

### Phase 2B: Dynamic Skill Checks
- Generate contextual challenges
- Balance difficulty requirements
- Validate stat constraints
- 3-week implementation (higher complexity)

### Phase 3: Story Continuity
- Track narrative across encounters
- Build persistent story arcs
- Session-level memory
- 4-week implementation

**But first: Prove the pattern with intro scenes.**

---

## Quick Decision Tree

```
Is the intro scene boring/repetitive after 10 plays?
├─ YES → Implement AI intro generation ✅
│   └─ Can I ship this in 2 weeks?
│       ├─ YES → Proceed with this guide ✅
│       └─ NO → Scope is too big, reduce
└─ NO → Focus on other features, defer AI
```

---

## Support Resources

**Documentation**:
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Claude API Reference](https://docs.anthropic.com/claude/reference)

**Example Prompt**:
```
You are a tabletop gaming narrator. Create a humorous 2-sentence intro scene.

Context:
- Character: Forever-GM (Has run 47 campaigns. Finished zero.)
- Item: Cursed d20 (Always Rolls 1) (Emotionally devastating)
- Location: Dave's Mom's Basement (Where legends are forged)

Requirements:
- 40-60 words total
- TPG humor (dice, rules, campaigns)
- Set the scene for a skill check
- Don't repeat card descriptions verbatim

Scene:
```

---

**Status**: READY TO BUILD
**Effort**: 2 weeks
**Risk**: LOW
**Impact**: HIGH

Start with `src/lib/aiService.ts` and work backward through the call stack.
