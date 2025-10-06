# 🎲 GLESOLAS - TPG Story Forge

A lean, mobile-first PWA storytelling card game for tabletop gaming nerds.

## 🌟 Features

- **Mobile-First Design**: Optimized for portrait mobile with desktop compatibility
- **TPG-Nerdy Theme**: Tabletop gaming culture references and terminology
- **PWA Support**: Installable on mobile devices, works offline
- **Templated Narrative**: Curated story content (no AI needed for MVP)
- **Core Game Loop**: Roll Initiative → Skill Check → Resolution
- **Three Skill Paths**: Might, Fortune, Cunning
- **Glory & Narrative Dice**: XP and resource management
- **Framer Motion**: Smooth card animations and transitions
- **Local Storage**: Session persistence without backend

## 🚀 Tech Stack

- **Vite** - Lightning-fast build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Beautiful component library
- **Framer Motion** - Animation library
- **Lucide Icons** - Icon system
- **Vite PWA** - Progressive Web App support

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Play

1. **Roll Initiative** - Draw 3 random lore cards to start your story
2. **Read Intro** - AI-style templated narrative sets the scene
3. **Face Skill Check** - Choose a skill path (Might/Fortune/Cunning)
4. **Play Response** - Select 3 cards to meet the challenge requirements
5. **Resolve** - See success or fumble, earn Glory Points
6. **Continue** - Play more encounters or end your session

## 📂 Project Structure

```
glesolas-game/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── LoreCardComponent.tsx
│   │   └── StatsDisplay.tsx
│   ├── data/
│   │   ├── cards.ts        # 20 TPG-themed lore cards
│   │   └── scenes.ts       # Templated story content
│   ├── lib/
│   │   ├── gameEngine.ts   # Core game logic
│   │   └── utils.ts        # Utility functions
│   ├── types/
│   │   └── game.ts         # TypeScript types
│   ├── App.tsx             # Main game component
│   └── index.css           # Global styles
├── public/                  # Static assets
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite + PWA configuration
└── package.json
```

## 🎨 TPG Terminology

| Standard Term | TPG Term |
|---------------|----------|
| Story Beat | Narrative Die |
| Challenge | Skill Check |
| XP | Glory Points |
| Power/Luck/Wit | Might/Fortune/Cunning |
| Cards | Lore Cards |
| Start Story | Roll Initiative |
| Session | Campaign Session |

## 🔧 Configuration

### PWA Manifest

Edit `vite.config.ts` to customize PWA settings:
- App name
- Theme colors
- Icons
- Orientation

### Game Balance

Adjust in `src/data/scenes.ts` and `src/lib/gameEngine.ts`:
- Skill check difficulty ranges
- Glory rewards per path
- Narrative Dice costs

## 🎯 MVP Scope

**What's Included:**
- ✅ Hardcoded 20-card deck
- ✅ Templated story scenes (30+ variations)
- ✅ Power/Luck/Wit stat system
- ✅ Challenge generation & resolution
- ✅ Glory & Narrative Dice economy
- ✅ Mobile-first responsive UI
- ✅ PWA offline capability
- ✅ Local storage session persistence

**What's Deferred (Phase 2):**
- ❌ Backend API
- ❌ AI integration (OpenRouter)
- ❌ User accounts
- ❌ Deck builder
- ❌ Co-op mode
- ❌ Cloud saves

## 📱 Mobile Testing

Test on mobile:
1. Build production: `npm run build`
2. Preview locally: `npm run preview`
3. Access from mobile via network URL
4. Use browser's "Add to Home Screen"

## 🛠️ Development

### Adding Cards

Edit `src/data/cards.ts`:

```typescript
{
  id: 'char_007',
  name: 'Your Card Name',
  type: 'Character',
  stats: { might: 2, fortune: 3, cunning: 1 },
  rarity: 'Common',
  flavor: 'Your flavor text here',
}
```

### Adding Story Scenes

Edit `src/data/scenes.ts` to add more challenges or resolution templates.

### Customizing Theme

Edit `src/index.css` CSS variables for dark mode theme colors.

## 📄 License

MIT

## 🎲 Credits

Built with tabletop gaming passion for the Forever-GMs and dice hoarders.
