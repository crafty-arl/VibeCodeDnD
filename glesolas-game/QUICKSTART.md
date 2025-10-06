# 🚀 Glesolas - Quick Start

## Development Server Running

Your game is currently running at **http://localhost:5174**

## What You Have

✅ **Fully Functional Mobile-First PWA**
- 20 TPG-themed lore cards (Forever-GM, Dice Hoarder, etc.)
- Complete game loop: Roll Initiative → Skill Check → Resolution
- Might/Fortune/Cunning stat system
- Glory Points & Narrative Dice economy
- Framer Motion animations
- Local storage persistence
- PWA manifest for mobile installation

## Quick Commands

```bash
# Development (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Game Flow

1. **Home Screen** → Click "Roll Initiative"
2. **Intro Scene** → Read AI-style templated story with your 3 cards
3. **Skill Check** → See Might/Fortune/Cunning requirements
4. **Response** → Select 3 new cards to meet the challenge
5. **Resolution** → Success or fumble, earn Glory & Narrative Dice
6. **Repeat** → Continue encounters or end session

## TPG Easter Eggs

Look for references to:
- "Actually, according to page 237..." (Rules Lawyer)
- The Cursed d20 that always rolls 1
- Dave's Mom's Basement
- Discord Voice Channel #3
- Campaign Graveyard
- The FLGS (Friendly Local Game Store)

## Mobile Testing

1. Build: `npm run build`
2. Preview: `npm run preview`
3. Open on your phone via network URL
4. Add to Home Screen
5. Enjoy offline gameplay!

## File Structure

```
src/
├── components/
│   ├── ui/              # Shadcn components
│   ├── LoreCardComponent.tsx
│   └── StatsDisplay.tsx
├── data/
│   ├── cards.ts         # 20 TPG cards
│   └── scenes.ts        # Story templates
├── lib/
│   ├── gameEngine.ts    # Core logic
│   └── utils.ts
├── types/
│   └── game.ts          # TypeScript types
└── App.tsx              # Main component
```

## Next Steps

### Phase 1 Complete ✅
- [x] Mobile-first PWA
- [x] TPG-themed cards
- [x] Core game loop
- [x] Local state management

### Phase 2 (Future)
- [ ] AI integration (OpenRouter + Qwen)
- [ ] Backend API (Cloudflare Workers)
- [ ] User accounts
- [ ] Deck builder
- [ ] Co-op mode

## Customization

### Add More Cards
Edit `src/data/cards.ts`:
```typescript
{
  id: 'char_007',
  name: 'The Player Who Forgot Dice',
  type: 'Character',
  stats: { might: 1, fortune: 4, cunning: 2 },
  rarity: 'Common',
  flavor: 'Borrowed cursed dice. Regretted it immediately.',
}
```

### Add Story Scenes
Edit `src/data/scenes.ts` to add challenges or resolutions.

### Adjust Difficulty
In `src/data/scenes.ts`, change requirement ranges:
```typescript
requirements: { might_req: 6, fortune_req: 5, cunning_req: 8 }
```

## Scope Discipline

**What This MVP Does:**
- ✅ Proves the game loop works
- ✅ Validates templated narratives
- ✅ Tests mobile UX
- ✅ Demonstrates stat mechanics

**What It Doesn't (Yet):**
- ❌ No backend (all local)
- ❌ No AI (curated content only)
- ❌ No user accounts
- ❌ No cloud saves

**Why:** Prototype first, validate gameplay, then add infrastructure.

## Deployment Ready

Your production build is in `dist/`:
- Ready for Cloudflare Pages
- Ready for Netlify
- Ready for Vercel
- PWA service worker included

Just deploy the `dist/` folder!

---

**Built for the Forever-GMs** 🎲
