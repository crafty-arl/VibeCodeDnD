# GLESOLAS Playground Mode - AI-Driven Creative Storytelling

## Overview
Playground Mode is a **fully AI-driven, sandbox storytelling experience** where players collaborate with the AI DM to create unique, emergent narratives. Unlike Campaign Mode's mechanical focus or structured Story Mode, Playground Mode prioritizes **creative freedom, player agency, and narrative experimentation**.

> **Core Philosophy**: "What if?" scenarios where the AI responds to player creativity rather than just card stats.

---

## Key Differences from Other Modes

| Feature | Campaign Mode | Playground Mode |
|---------|--------------|-----------------|
| **Goal** | Glory grinding, deck optimization | Creative storytelling, experimentation |
| **Structure** | Infinite encounters, stat-driven | Player-directed narrative flow |
| **AI Role** | Generate challenges & resolutions | Full co-author & story partner |
| **Player Input** | Card selection only | Cards + custom prompts + story direction |
| **Narrative** | TPG-themed templates | Any genre/theme/setting |
| **Failure** | Mechanical (stat check fails) | Story twist (never "game over") |
| **Ending** | Player decides | Story reaches natural conclusion |

---

## Core Mechanics

### 1. **Narrative Prompts** (Player-Driven Input)

Players can inject custom prompts at any time to steer the story:

```typescript
export interface NarrativePrompt {
  type: 'scene' | 'character-action' | 'plot-twist' | 'tone-shift' | 'question';
  prompt: string; // Player's creative input
  cards?: LoreCard[]; // Optional: cards to incorporate
}
```

**Example Prompts:**
- **Scene**: "My character enters a floating tavern in the clouds"
- **Character Action**: "I want to befriend the dragon instead of fighting it"
- **Plot Twist**: "What if the villain was actually my character's mentor?"
- **Tone Shift**: "Make this scene more comedic"
- **Question**: "What secrets does this ancient library hold?"

### 2. **Free-Form Card Usage**

Cards aren't just stat blocks—they're **narrative tools**:

- **Character Cards**: Become protagonists, NPCs, or aspects of the player
- **Item Cards**: Plot devices, MacGuffins, or symbolic objects
- **Location Cards**: Settings that evolve based on story needs

**Example:**
- Player has: "Rusty Sword" (Item), "Haunted Castle" (Location), "Brave Knight" (Character)
- Instead of stat check, AI weaves: "As the Brave Knight, you enter the Haunted Castle. The Rusty Sword begins to glow—it once belonged to this castle's lost king..."

### 3. **Dynamic Challenge System**

Challenges emerge **from the narrative**, not random pools:

```typescript
export interface PlaygroundChallenge {
  context: string; // What's happening in the story
  narrativeQuestion: string; // "How do you respond?"

  // Flexible resolution paths
  suggestedApproaches: {
    path: SkillPath;
    narrative: string; // AI-generated based on story context
  }[];

  // OR allow custom approach
  allowCustomApproach: boolean; // Player describes their own solution
}
```

**Example:**
```
Context: "The dragon blocks your path, but you notice it's wounded and afraid."

Narrative Question: "How do you proceed?"

Suggested Approaches:
├─ Might: "Slay the dragon before it attacks you"
├─ Fortune: "Try to sneak past while it's distracted"
├─ Cunning: "Discover why it's wounded and negotiate"
└─ Custom: [Player types: "I sing a lullaby to calm it"]
```

### 4. **Story Memory & Continuity**

The AI tracks the entire narrative and references past events:

```typescript
export interface StoryMemory {
  sessionId: string;
  genre: string; // Player-chosen or AI-detected
  keyEvents: string[]; // Major story beats
  characters: Record<string, string>; // Name -> description/role
  locations: Record<string, string>; // Name -> current state
  relationships: string[]; // "Player trusts the wizard", etc.
  themes: string[]; // "Redemption", "Betrayal", "Mystery"

  // For AI context
  narrativeSummary: string; // Condensed story so far
  currentTone: string; // "Tense", "Whimsical", "Dark"
}
```

This memory feeds into **every AI prompt**, ensuring coherent storytelling.

---

## User Experience Flow

### 1. Starting a Playground Session

```
┌─────────────────────────────────────┐
│  🎨 PLAYGROUND MODE                 │
├─────────────────────────────────────┤
│  Create your own story adventure    │
│                                     │
│  Choose Your Setup:                 │
│  ┌─────────────────────────────┐   │
│  │ ⚙️ Quick Start              │   │
│  │ AI generates opening scene  │   │
│  │ [Random Cards]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✍️ Custom Start             │   │
│  │ You describe the opening    │   │
│  │ [Choose Your Cards]         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎲 Theme Starter            │   │
│  │ Pick a genre/theme:         │   │
│  │ [Mystery] [Action] [Comedy] │   │
│  │ [Horror] [Romance] [Epic]   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 2. Custom Opening Scene

If player chooses custom:

```
┌─────────────────────────────────────┐
│  ✍️ Describe Your Opening Scene     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ Where does your story begin?│   │
│  │                             │   │
│  │ [Text Area]                 │   │
│  │ "I'm a detective in a       │   │
│  │ cyberpunk city, investigating│   │
│  │ a murder at a noodle shop..." │   │
│  └─────────────────────────────┘   │
│                                     │
│  Select Cards to Incorporate:       │
│  [Card Carousel]                    │
│                                     │
│  [✨ Generate Opening]              │
└─────────────────────────────────────┘
```

### 3. Gameplay Loop

```
┌─────────────────────────────────────┐
│  📖 Your Story                      │
├─────────────────────────────────────┤
│  [AI-Generated Scene]               │
│  "You step into the neon-lit noodle │
│  shop. The owner's body lies behind │
│  the counter. Strange symbols are   │
│  carved into the wall..."           │
│                                     │
│  💭 What do you do?                 │
│                                     │
│  [Suggested Actions] (AI-generated) │
│  ┌─ Might ─────────────────────┐   │
│  │ Search the body for clues   │   │
│  └─────────────────────────────┘   │
│  ┌─ Cunning ───────────────────┐   │
│  │ Analyze the wall symbols    │   │
│  └─────────────────────────────┘   │
│  ┌─ Fortune ───────────────────┐   │
│  │ Look for security footage   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✨ Custom Action            │   │
│  │ [Type your own response]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  🃏 Use Cards in Scene:             │
│  [Card Hand - Drag to Activate]     │
└─────────────────────────────────────┘
```

### 4. Custom Player Actions

When player types custom action:

```
Player Input: "I taste the noodles to see if they're poisoned"

AI Response:
"You cautiously sample the cold noodles. Your Rogue's Instinct
(card) tingles—there's a faint almond smell. Cyanide?

The symbols on the wall suddenly glow. They're not random—
they're a recipe. But for what?"

[New Narrative Choices Emerge...]
```

### 5. Story Twists & Player Direction

At any point, player can inject story changes:

```
┌─────────────────────────────────────┐
│  🌀 Story Controls                  │
├─────────────────────────────────────┤
│  [💡 Add Plot Twist]                │
│  [🎭 Change Tone]                   │
│  [❓ Ask the AI]                    │
│  [⏩ Skip Ahead]                    │
│  [⏪ Rewind Scene]                  │
└─────────────────────────────────────┘
```

**Add Plot Twist:**
```
Player: "What if my detective character is actually an android
        who doesn't know it?"

AI: "As you touch the glowing symbols, static fills your vision.
     Memories that aren't yours flood in—assembly lines,
     serial numbers, a face that looks like yours marked
     'Prototype 07'. Your hand trembles. It's not flesh.
     It's synthetic skin..."
```

### 6. Story Endings

Unlike Campaign Mode's "until player stops," Playground Mode **naturally concludes** when narrative arcs resolve:

```
┌─────────────────────────────────────┐
│  🎬 Story Conclusion                │
├─────────────────────────────────────┤
│  [Final Scene Narrative]            │
│  "The corporation's secret is       │
│  exposed. You, an android, stand    │
│  as proof of their crimes. The city │
│  will never be the same..."         │
│                                     │
│  📊 Your Story                      │
│  ├─ Scenes: 12                      │
│  ├─ Twists: 3                       │
│  ├─ Cards Used: 15                  │
│  └─ Genre: Cyberpunk Mystery        │
│                                     │
│  💾 Save Story                      │
│  [Export as PDF] [Share Link]       │
│                                     │
│  [🔄 New Story] [📖 Story Library]  │
└─────────────────────────────────────┘
```

---

## Advanced Features

### 1. **AI Co-Author Tools**

```typescript
export interface AICoAuthorTools {
  // Player asks AI for suggestions
  suggestScene: () => string[]; // AI offers 3 scene ideas
  suggestCharacter: () => string[]; // NPC suggestions
  suggestTwist: () => string[]; // Plot twist ideas

  // AI analysis
  analyzeStory: () => StoryAnalysis; // Themes, pacing, etc.
  suggestEnding: () => string[]; // Potential conclusions
}
```

**Example:**
```
Player: [Clicks "Suggest Plot Twist"]

AI Suggestions:
1. "The noodle shop owner is still alive—it's a clone who died"
2. "The symbols are a map to an underground android sanctuary"
3. "Your partner is working for the corporation"

Player: [Selects #2]

AI: "The symbols align with city infrastructure maps. They
     point to the old subway tunnels beneath the city..."
```

### 2. **Genre Blending**

Player can shift genres mid-story:

```
Current Genre: Cyberpunk Mystery
Player Action: "Suddenly, magic exists in this world"

AI Adapts: "The symbols aren't tech—they're ancient runes.
            Your android sensors detect... impossible energy.
            Magic and circuits shouldn't mix, but here you are..."

New Genre: Cyberpunk Fantasy Mystery
```

### 3. **Multi-Path Exploration (Rewind & Branch)**

Players can explore "what if" scenarios:

```
┌─────────────────────────────────────┐
│  🌳 Story Branches                  │
├─────────────────────────────────────┤
│  Scene 5: Confronting the CEO       │
│  ├─ Branch A: You revealed truth    │
│  │   └─ [Currently Playing]         │
│  └─ Branch B: You took the bribe    │
│      └─ [Explore This Path]         │
│                                     │
│  [Rewind to Scene 5]                │
└─────────────────────────────────────┘
```

### 4. **Story Library & Sharing**

```typescript
export interface PlaygroundStory {
  id: string;
  title: string;
  summary: string;
  genre: string[];
  scenes: PlaygroundScene[];
  totalLength: number; // Scene count
  cardsUsed: string[]; // Card IDs featured
  createdAt: number;

  // Sharing
  isPublic: boolean;
  shareCode?: string; // For sharing with friends

  // Metadata
  playerChoices: number; // Custom actions vs suggested
  creativityScore: number; // AI-calculated novelty
}
```

Players can:
- Save stories to replay later
- Export as shareable links or PDFs
- Browse other players' public stories
- Use someone else's story as a template

---

## Technical Architecture

### New Components

```
/src/
  ├── types/
  │   └── playground.ts         # Playground-specific types
  ├── lib/
  │   ├── playgroundEngine.ts   # Core story engine
  │   ├── storyMemory.ts        # Narrative tracking
  │   ├── aiCoAuthor.ts         # AI suggestion tools
  │   └── narrativeAnalyzer.ts  # Story analysis
  ├── components/
  │   ├── PlaygroundStart.tsx   # Setup screen
  │   ├── CustomPromptInput.tsx # Player input
  │   ├── StoryControls.tsx     # Twist/rewind/etc
  │   ├── AICoAuthorPanel.tsx   # Suggestion UI
  │   └── StoryLibrary.tsx      # Saved stories
```

### AI Prompt Strategy

**Context-Rich Prompts with Memory:**

```typescript
export function buildPlaygroundPrompt(
  memory: StoryMemory,
  playerInput: NarrativePrompt,
  cards: LoreCard[]
): string {
  const activeDM = NarratorManager.getActiveNarrator();

  return `You are "${activeDM.name}", an AI Dungeon Master co-creating a story with the player.

**DM Personality:**
${activeDM.personality}
Tone: ${activeDM.tone}
Style: ${activeDM.style}

**Story So Far:**
Genre: ${memory.genre}
Summary: ${memory.narrativeSummary}
Key Events: ${memory.keyEvents.join(', ')}
Current Tone: ${memory.currentTone}
Themes: ${memory.themes.join(', ')}

**Active Characters:**
${Object.entries(memory.characters).map(([name, desc]) => `- ${name}: ${desc}`).join('\n')}

**Current Location:**
${Object.entries(memory.locations).slice(-1)[0]?.[1] || 'Unknown'}

**Player's Latest Action:**
Type: ${playerInput.type}
Action: "${playerInput.prompt}"

**Cards in Play:**
${cards.map(c => `- ${c.name}: ${c.flavor}`).join('\n')}

**Your Task:**
Continue the story based on the player's action.
- Maintain narrative continuity with past events
- Incorporate the cards naturally (don't force them)
- Match the established tone unless player shifts it
- Generate ${playerInput.type === 'question' ? 'an answer' : 'the next scene'} (2-4 sentences)
- End with a question or narrative hook

Stay true to YOUR DM personality throughout.`;
}
```

### Story Memory Updates

After each AI response, update memory:

```typescript
export class StoryMemoryManager {
  static updateMemory(
    memory: StoryMemory,
    newScene: string,
    playerChoice: string
  ): StoryMemory {
    // Extract key info from new scene
    const events = this.extractKeyEvents(newScene);
    const characters = this.extractCharacters(newScene);
    const tone = this.detectTone(newScene);

    // Update summary (condensed history)
    const updatedSummary = this.condenseSummary(
      memory.narrativeSummary,
      newScene,
      playerChoice
    );

    return {
      ...memory,
      keyEvents: [...memory.keyEvents, ...events],
      characters: { ...memory.characters, ...characters },
      currentTone: tone,
      narrativeSummary: updatedSummary,
    };
  }
}
```

---

## Example Session Flow

### Opening

**Player:** "Quick Start with Mystery theme"

**AI:** "You wake in a locked room. Three objects lie before you: a golden key, a cryptic letter, and a compass pointing north—always north, even when you turn."

**Cards Drawn:** "Golden Key" (Item), "Mysterious Letter" (Item), "Magic Compass" (Item)

### Scene 2

**Player Types:** "I read the letter"

**AI:** "The letter reads: 'Trust only the wind.' Signed with a symbol matching the one on the compass. The north wall begins to crack..."

### Scene 3

**Player:** [Selects Might] "I break through the north wall"

**AI:** "Your strength shatters the wall. Beyond: an endless library. Books float, pages turning by themselves. A figure in robes turns to you: 'You weren't supposed to wake up.'"

**Player:** [💡 Add Plot Twist] "What if I'm the villain in this story?"

**AI:** "The robed figure smiles sadly. 'You remember now? You created this prison... for yourself. The others—they're still trapped in the rooms below, because of you.'"

### Ending

**Player:** [Custom Action] "I use the compass to find and free the others, making amends"

**AI:** "The compass spins wildly, then splits into fragments—one for each prisoner. As you release them, your own memories return. Redemption burns, but you've chosen it. The library fades. You wake in the real world, the others beside you, free at last."

---

## Playground Mode vs Campaign Mode Summary

**Campaign Mode:**
- ⚔️ Mechanical gameplay
- 📊 Stat optimization
- 🔁 Infinite grind
- 🎯 Goal: Glory & deck building

**Playground Mode:**
- 🎨 Creative storytelling
- ✍️ Player agency
- 📖 Natural conclusions
- 🎯 Goal: Unique narratives & experimentation

---

## Implementation Roadmap

### Phase 1: Core Playground (MVP)
- [ ] Custom opening scene input
- [ ] Dynamic narrative prompts
- [ ] Story memory system
- [ ] Basic AI co-authoring
- [ ] Natural story endings

### Phase 2: Advanced Tools
- [ ] AI suggestion panel (twists, characters, etc.)
- [ ] Story rewind & branching
- [ ] Genre blending support
- [ ] Enhanced memory (relationships, themes)

### Phase 3: Social Features
- [ ] Story library (save/load)
- [ ] Export stories (PDF, share links)
- [ ] Public story browsing
- [ ] Story templates from community

### Phase 4: AI Enhancements
- [ ] Creativity scoring
- [ ] Narrative analysis tools
- [ ] Multi-session story arcs
- [ ] Voice narration integration

---

## UI Mockups

### Playground Main Screen

```
┌──────────────────────────────────────┐
│  🎨 Playground: "Locked Room Mystery"│
│  Scene 4 of ???                      │
├──────────────────────────────────────┤
│  📖 Narrative                        │
│  ┌────────────────────────────────┐ │
│  │ The robed figure steps closer. │ │
│  │ "Your victims—they're alive,   │ │
│  │ waiting. Will you face them?"  │ │
│  └────────────────────────────────┘ │
│                                      │
│  💭 Your Move                        │
│  ┌────────────────────────────────┐ │
│  │ [Type your action...]          │ │
│  │                                │ │
│  │ "I bow my head and whisper..." │ │
│  └────────────────────────────────┘ │
│                                      │
│  💡 AI Suggestions                   │
│  ├─ [Accept your guilt]             │
│  ├─ [Deny everything]               │
│  └─ [Ask who the figure is]         │
│                                      │
│  🃏 Cards: [3 available]             │
│  [Golden Key] [Letter] [Compass]    │
│                                      │
│  ⚙️ Story Tools                      │
│  [💡 Twist] [🎭 Tone] [❓ Ask AI]    │
└──────────────────────────────────────┘
```

---

This Playground Mode turns GLESOLAS into a **collaborative storytelling sandbox** where the AI and player co-author unique narratives. The focus shifts from stats to creativity, making every session a one-of-a-kind story.
