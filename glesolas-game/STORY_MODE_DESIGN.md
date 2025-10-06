# GLESOLAS Story Mode - Design Specification

## Overview
Story Mode transforms GLESOLAS into a structured narrative experience with pre-authored story arcs, character progression, and meaningful choices that shape the outcome. Unlike Campaign Mode's procedural encounters, Story Mode features:

- **Pre-authored narratives** with beginning, middle, and end
- **Branching storylines** based on player choices and success/failure
- **Character development** through persistent deck evolution
- **Unlockable content** (new stories, cards, narrators)
- **Multiple endings** determined by player actions

---

## Core Architecture

### Story Structure

```typescript
export interface StoryChapter {
  id: string;
  title: string;
  description: string;
  requiredGlory: number; // Unlock requirement
  isUnlocked: boolean;

  // Story metadata
  estimatedLength: number; // Number of encounters
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Epic';
  theme: string; // 'Mystery', 'Comedy', 'Action', 'Horror', etc.

  // Rewards
  rewards: {
    glory: number;
    unlockedCards?: string[]; // Card IDs
    unlockedNarrator?: string; // Narrator ID
    achievementId?: string;
  };
}

export interface StoryEncounter {
  id: string;
  chapterId: string;
  order: number; // Sequence in the chapter

  // Narrative content (can be AI-generated or pre-authored)
  scene: string;
  imagePrompt?: string;

  // Challenge data
  challenge?: SkillCheck;
  allowedPaths?: SkillPath[]; // Restrict certain paths

  // Branching logic
  successBranch: string | 'next' | 'end'; // Next encounter ID
  failureBranch?: string | 'next' | 'end'; // Optional alternate path

  // Special mechanics
  forcedCards?: string[]; // Specific cards that must be in hand
  deckRestrictions?: {
    requiredType?: CardType;
    maxRarity?: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  };
}

export interface StoryProgress {
  chapterId: string;
  currentEncounterId: string;
  encountersCompleted: string[];
  pathsTaken: Record<string, SkillPath>; // encounter ID -> path chosen
  endingReached?: string; // Ending ID if completed
  startTime: number;
  completionTime?: number;
}
```

### Story Data Storage

Stories are stored as JSON manifests:

```
/stories/
  ├── chapter-01-the-missing-dice/
  │   ├── manifest.json      # Chapter metadata
  │   ├── encounters.json    # Encounter sequence & branching
  │   ├── endings.json       # Multiple ending variants
  │   └── rewards.json       # Unlockables
  ├── chapter-02-rules-lawyer/
  └── chapter-03-epic-campaign/
```

---

## User Experience Flow

### 1. Story Selection (Home Screen)

```
┌─────────────────────────────────┐
│  STORY MODE                     │
├─────────────────────────────────┤
│  Chapter 1: The Missing Dice    │
│  [Unlocked] ✓                   │
│  Difficulty: Easy               │
│  Estimated: 5 encounters        │
│  Theme: Mystery                 │
│  [▶ Start Story]                │
├─────────────────────────────────┤
│  Chapter 2: The Rules Lawyer    │
│  [Locked] 🔒 (Requires 200 Glory)│
├─────────────────────────────────┤
│  Chapter 3: Epic Campaign       │
│  [Locked] 🔒 (Complete Ch. 1 & 2)│
└─────────────────────────────────┘
```

### 2. Story Intro

When starting a story:
- Show chapter title card with flavor text
- Display recommended deck/stats
- Option to select starting deck or use preset
- "Begin Chapter" button

### 3. Encounter Flow

**Modified from Campaign Mode:**

```
┌─────────────────────────────┐
│  Chapter Progress: 3/7      │
│  Current Scene: The Library │
└─────────────────────────────┘

[Narrative Text]
"You enter the dusty library, searching for clues about the missing dice.
The librarian eyes you suspiciously..."

[Challenge]
Convince the librarian to help you
Might: 5  Fortune: 6  Cunning: 7

[Your Cards] (Select 3 from hand of 5)

[After selection → Action Choice]

┌─ Might Path (Unlocked) ────┐
│ Intimidate the librarian   │
│ with your warrior's might  │
└────────────────────────────┘

┌─ Cunning Path (Unlocked) ──┐
│ Charm them with wit and    │
│ cite obscure library rules │
└────────────────────────────┘

[Resolution → Branch to next encounter]
```

**Key Differences from Campaign:**
- Progress bar shows chapter completion
- Encounters are sequential (not infinite)
- Branching: success/failure lead to different paths
- No "End Session" until story complete
- Auto-save checkpoints at key moments

### 4. Branching & Consequences

```mermaid
Encounter 1 (Library)
  ├─ Success (Cunning) → Encounter 2a (Ally Found)
  └─ Failure → Encounter 2b (Hostile Librarian)

Encounter 2a
  ├─ Success → Encounter 3 (Clue Discovered)
  └─ Failure → Encounter 3 (Partial Clue)

Encounter 2b
  ├─ Success (Might) → Encounter 3 (Fight Avoided)
  └─ Failure → Encounter 3 (Combat Encounter)
```

### 5. Story Endings

Based on accumulated choices:

```typescript
export interface StoryEnding {
  id: string;
  chapterId: string;
  title: string;
  narrative: string;
  requirements: {
    minSuccesses?: number;
    requiredPaths?: SkillPath[]; // Must have used these paths
    forbiddenEncounters?: string[]; // Can't have visited these
  };
  rewards: {
    glory: number;
    achievement?: string;
    unlockedContent?: string[];
  };
}
```

**Example Endings:**
- **"Perfect Victory"**: All encounters succeeded, used varied paths
- **"Cunning Strategist"**: Won primarily with Cunning
- **"Lucky Survivor"**: Won with mostly Fortune (high risk)
- **"Brutal Approach"**: Won with Might, but consequences in narrative
- **"Tragic Failure"**: Failed key encounters, story ends darkly

---

## Story Authoring System

### Hybrid Approach: Templates + AI Enhancement

**Option 1: Fully Pre-authored (No AI)**
- Authors write all narrative text
- Fixed challenges with set requirements
- Linear or branching paths
- Best for tightly controlled stories

**Option 2: AI-Enhanced (Recommended)**
- Authors provide scene outlines & key beats
- AI generates full narrative text dynamically
- Maintains story consistency via context
- Replayability through varied descriptions

```typescript
export interface EncounterTemplate {
  outline: string; // "Player searches library for clues"
  keyBeats: string[]; // ["Librarian suspicious", "Ancient tome discovered"]
  tone: 'serious' | 'humorous' | 'dramatic';
  aiGenerate: boolean; // Use AI or static text
}
```

### Story Builder Tool (Future Feature)

Visual editor for non-coders to create stories:
- Drag-and-drop encounter nodes
- Branching path editor
- Challenge difficulty sliders
- Preview mode with test hands
- Export to JSON

---

## Technical Implementation

### New Files/Components

```
/src/
  ├── types/
  │   └── story.ts              # Story types
  ├── data/
  │   └── stories/
  │       ├── index.ts          # Story registry
  │       └── chapter-01.ts     # Example story data
  ├── lib/
  │   ├── storyEngine.ts        # Story progression logic
  │   └── storyManager.ts       # Save/load story progress
  ├── components/
  │   ├── StorySelector.tsx     # Story selection screen
  │   ├── ChapterProgress.tsx   # Progress indicator
  │   ├── StoryEnding.tsx       # Ending screen
  │   └── BranchingNarrative.tsx # Shows branching paths
```

### Game Mode Toggle

```typescript
export type GameMode = 'campaign' | 'story' | 'arena';

export interface GameState {
  mode: GameMode;
  // ... existing state
  storyProgress?: StoryProgress; // Only for story mode
}
```

**App.tsx modifications:**
- Add mode selector on home screen
- Conditional rendering based on mode
- Story mode uses `storyEngine` instead of procedural generation

### Story Engine Logic

```typescript
export class StoryEngine {
  /**
   * Load a story chapter and initialize progress
   */
  static startChapter(chapterId: string, deckId?: string): StoryProgress {
    const chapter = StoryRegistry.getChapter(chapterId);
    const firstEncounter = chapter.encounters[0];

    return {
      chapterId,
      currentEncounterId: firstEncounter.id,
      encountersCompleted: [],
      pathsTaken: {},
      startTime: Date.now(),
    };
  }

  /**
   * Get the current encounter based on progress
   */
  static getCurrentEncounter(progress: StoryProgress): StoryEncounter {
    return StoryRegistry.getEncounter(progress.currentEncounterId);
  }

  /**
   * Advance story based on player's choice and result
   */
  static advanceStory(
    progress: StoryProgress,
    result: RollResult
  ): StoryProgress {
    const encounter = this.getCurrentEncounter(progress);

    // Record the path taken
    const newPathsTaken = {
      ...progress.pathsTaken,
      [encounter.id]: result.path,
    };

    // Determine next encounter
    const nextId = result.success
      ? encounter.successBranch
      : (encounter.failureBranch || encounter.successBranch);

    // Check if story ended
    if (nextId === 'end') {
      const ending = this.determineEnding(progress, newPathsTaken);
      return {
        ...progress,
        encountersCompleted: [...progress.encountersCompleted, encounter.id],
        pathsTaken: newPathsTaken,
        endingReached: ending.id,
        completionTime: Date.now(),
      };
    }

    // Continue to next encounter
    return {
      ...progress,
      currentEncounterId: nextId === 'next'
        ? this.getNextSequentialEncounter(encounter)
        : nextId,
      encountersCompleted: [...progress.encountersCompleted, encounter.id],
      pathsTaken: newPathsTaken,
    };
  }

  /**
   * Determine which ending the player earned
   */
  static determineEnding(
    progress: StoryProgress,
    pathsTaken: Record<string, SkillPath>
  ): StoryEnding {
    const chapter = StoryRegistry.getChapter(progress.chapterId);
    const endings = chapter.endings;

    // Evaluate ending requirements
    for (const ending of endings) {
      if (this.meetsEndingRequirements(ending, progress, pathsTaken)) {
        return ending;
      }
    }

    // Fallback to default ending
    return endings.find(e => e.id === 'default')!;
  }
}
```

---

## Example Story: "Chapter 1 - The Missing Dice"

### Story Outline

**Theme:** Mystery/Comedy
**Difficulty:** Easy
**Length:** 5-7 encounters
**Unlock:** Available from start

**Plot:** The party's lucky d20 has gone missing before the big campaign finale. You must investigate the gaming store, interrogate suspects, and recover the dice before game night.

### Encounter Map

```
1. Intro: The Disappearance
   ↓
2. Investigate Gaming Store
   ├─ Success (Cunning) → 3a. Clue Found
   └─ Failure → 3b. Store Owner Suspicious

3a. Follow the Trail
   ↓
4. Confront the Thief
   ├─ Success (Might) → Ending A: "Justice Served"
   ├─ Success (Fortune) → Ending B: "Lucky Break"
   └─ Success (Cunning) → Ending C: "Mastermind"

3b. Smooth Things Over
   ↓
4. Alternative Investigation
   ↓
5. Last Chance Confrontation
   └─ Any Success → Ending D: "Redemption"
   └─ Failure → Ending E: "Borrow Dice"
```

### Sample Encounters

**Encounter 1: The Disappearance**
```json
{
  "id": "ch1-enc1",
  "scene": "Game night starts in 2 hours. Your prized d20 is missing. Your friends look worried. The empty dice bag mocks you.",
  "challenge": null,
  "successBranch": "ch1-enc2"
}
```

**Encounter 2: Gaming Store**
```json
{
  "id": "ch1-enc2",
  "scene": "The local gaming store is packed. The owner remembers someone asking about rare dice. Time to investigate.",
  "challenge": {
    "might_req": 4,
    "fortune_req": 5,
    "cunning_req": 6
  },
  "successBranch": "ch1-enc3a",
  "failureBranch": "ch1-enc3b"
}
```

---

## Rewards & Progression

### Chapter Completion Rewards

| Chapter | Glory | Cards Unlocked | Special Rewards |
|---------|-------|----------------|-----------------|
| Chapter 1 | 100 | "Lucky Dice", "Keen Investigator" | Narrator: "Detective DM" |
| Chapter 2 | 200 | "Rules Compendium", "Lawyer's Brief" | New difficulty level |
| Chapter 3 | 500 | Legendary cards (3x) | Story Mode+ (hard mode) |

### Achievement System

```typescript
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rewardGlory: number;
}
```

**Example Achievements:**
- **"Perfect Chapter"**: Complete chapter with all successes
- **"Path Master"**: Use all 3 paths in a single chapter
- **"Speed Runner"**: Complete chapter in under 10 minutes
- **"Completionist"**: Unlock all endings for a chapter

---

## Comparison: Campaign vs Story Mode

| Feature | Campaign Mode | Story Mode |
|---------|--------------|------------|
| Structure | Infinite procedural | Fixed chapters (5-10 encounters) |
| Narrative | AI-generated on-the-fly | Pre-authored + AI enhancement |
| Ending | Player ends when ready | Multiple story endings |
| Branching | Linear progression | Branching paths & consequences |
| Difficulty | Player-selected level | Per-chapter difficulty |
| Rewards | Glory accumulation | Chapter rewards + achievements |
| Replayability | Infinite variety | Multiple playthroughs for endings |
| Deck Changes | Full customization | Sometimes restricted by story |

---

## Implementation Phases

### Phase 1: Core Story Engine (MVP)
- [ ] Define story data types
- [ ] Create StoryEngine for progression logic
- [ ] Build basic StorySelector component
- [ ] Implement one example story (Chapter 1)
- [ ] Add chapter progress UI
- [ ] Integrate with existing game loop

### Phase 2: Branching & Endings
- [ ] Implement branching logic
- [ ] Create ending evaluation system
- [ ] Design ending screen with rewards
- [ ] Add save/load for story progress
- [ ] Create 3-5 endings for Chapter 1

### Phase 3: Content Expansion
- [ ] Write Chapter 2 & 3
- [ ] Add achievement system
- [ ] Create unlockable cards/narrators
- [ ] Polish UI/UX for story mode

### Phase 4: Advanced Features (Future)
- [ ] Story Builder tool (web editor)
- [ ] Community story sharing
- [ ] Procedural story generation (AI creates full chapters)
- [ ] Voice narration integration

---

## UI Mockups

### Story Selection Screen

```
┌────────────────────────────────────┐
│  ◀ Back to Home                    │
├────────────────────────────────────┤
│  📖 STORY MODE                     │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ Chapter 1: Missing Dice      │ │
│  │ ⭐⭐⭐ Easy                   │ │
│  │ 🎭 Mystery/Comedy            │ │
│  │ ⏱️ ~15 minutes               │ │
│  │                              │ │
│  │ The party's lucky d20 has    │ │
│  │ vanished! Find it before...  │ │
│  │                              │ │
│  │ Rewards: 100 Glory, 2 Cards  │ │
│  │                              │ │
│  │ Progress: ██████░░ 3/5       │ │
│  │ Best Ending: "Lucky Break"   │ │
│  │                              │ │
│  │ [▶ Continue] [↻ Restart]     │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Chapter 2: Rules Lawyer      │ │
│  │ 🔒 Requires 200 Glory        │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

### In-Story Progress Bar

```
┌────────────────────────────────────┐
│ Ch. 1: Missing Dice  [Encounter 3/5]│
│ ●━━●━━●━━○━━○                     │
└────────────────────────────────────┘
```

### Ending Screen

```
┌────────────────────────────────────┐
│        🎉 CHAPTER COMPLETE 🎉      │
├────────────────────────────────────┤
│  "LUCKY BREAK"                     │
│                                    │
│  Against all odds, you recovered   │
│  the dice through pure fortune.    │
│  The d20 rolled a nat 20 when you  │
│  needed it most!                   │
│                                    │
│  📊 Stats                          │
│  ├─ Encounters: 5/5                │
│  ├─ Successes: 4/5                 │
│  ├─ Paths Used: Fortune (3x)       │
│  └─ Time: 12:34                    │
│                                    │
│  🏆 Rewards                        │
│  ├─ +100 Glory                     │
│  ├─ Card: "Lucky Dice" (Legendary) │
│  └─ Narrator: "Detective DM"       │
│                                    │
│  [🔄 Play Again] [🏠 Home]         │
└────────────────────────────────────┘
```

---

## Summary

Story Mode transforms GLESOLAS into a narrative-driven experience while maintaining the core card-based gameplay. Key innovations:

1. **Structured storytelling** with pre-authored chapters
2. **Meaningful choices** that branch the narrative
3. **Multiple endings** based on player actions
4. **Progression rewards** (cards, narrators, achievements)
5. **Hybrid authoring** (templates + AI enhancement)
6. **Replayability** through different paths and endings

This mode complements Campaign Mode by offering:
- **Guided experience** for new players
- **Clear goals** and completion satisfaction
- **Unlockable content** to drive engagement
- **Story variety** beyond procedural generation

The system is designed to be **extensible** - supporting community-created stories, procedural generation, and future features like co-op story mode.
