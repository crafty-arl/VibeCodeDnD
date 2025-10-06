# /quest Tutorial System

## Overview
A comprehensive, step-by-step tutorial system that guides new players through their first game session, explaining all core mechanics and gameplay concepts.

## Features

### 📚 14-Step Interactive Tutorial
The tutorial covers all essential gameplay elements:

1. **Welcome** - Introduction to /quest
2. **Game Modes** - Overview of Campaign, Playground, and Arena modes
3. **Campaign Intro** - Campaign Mode basics
4. **Stats Explained** - Understanding Might, Fortune, and Cunning
5. **Deck Selection** - How to choose and build decks
6. **Intro Scene** - AI-generated narrative beginnings
7. **Challenge Explained** - Understanding stat requirements
8. **Card Selection** - Choosing 3 cards from your hand
9. **Stat Requirements** - Meeting challenge thresholds
10. **Action Paths** - Choosing your approach
11. **Resolution** - Understanding outcomes
12. **Rewards** - Glory and progression system
13. **Next Encounter** - Continuing your adventure
14. **Complete** - Final tips and encouragement

### ✨ Smart Tutorial Flow
- **First-Time Detection**: Automatically triggers for new users on first Campaign Mode launch
- **Context-Aware**: Tutorial steps advance based on actual gameplay actions
- **Skippable**: Users can skip the tutorial at any time
- **Replayable**: Completed users can replay tutorial from the home screen
- **Non-Intrusive**: Full-screen overlay with clear visual hierarchy

### 🎨 User Experience
- **Beautiful UI**: Cards with gradients, icons, and animated progress indicators
- **Key Points**: Bullet-point summaries for each concept
- **Progress Tracking**: Visual progress dots and step counter
- **Completion Celebration**: Special completion screen with confetti-style animation

## Technical Implementation

### Files Created
- `src/types/tutorial.ts` - TypeScript types for tutorial state
- `src/components/TutorialOverlay.tsx` - Main tutorial UI components
- Updated `src/App.tsx` - Tutorial integration with game flow

### State Management
```typescript
const [tutorialActive, setTutorialActive] = useState(false);
const [tutorialStep, setTutorialStep] = useState<TutorialStep>('welcome');
const [tutorialCompleted, setTutorialCompleted] = useState(false);
```

### Persistence
- Tutorial completion status saved to `localStorage` as `quest_tutorial_completed`
- Persists across sessions
- Can be reset by clearing browser data

## How It Works

### For First-Time Users
1. User selects Campaign Mode
2. Clicks "Roll Initiative"
3. Tutorial automatically starts with welcome screen
4. Tutorial guides through entire first encounter
5. User completes tutorial or skips
6. Tutorial marked as completed in localStorage

### For Returning Users
1. "Replay Tutorial" button appears on home screen
2. Clicking it restarts tutorial from the beginning
3. Can be skipped at any time

### Tutorial Progression Logic
The tutorial advances automatically at key game events:
- **Game mode selection** → advances to campaign intro
- **Starting game** → advances to intro scene
- **Continuing from intro** → advances to challenge
- **Selecting 3 cards** → advances to card selection/stat requirements
- **Playing cards** → advances to action paths
- **Choosing path** → advances to resolution → rewards
- **Next encounter click** → advances to next encounter explanation → complete

## Customization

### Adding New Tutorial Steps
1. Add step to `TutorialStep` type in `src/types/tutorial.ts`
2. Add step config to `tutorialSteps` object in `TutorialOverlay.tsx`
3. Add step to `tutorialStepOrder` array in `App.tsx`
4. Add advancement logic in relevant game phase handlers

### Modifying Tutorial Content
Edit the `tutorialSteps` object in `src/components/TutorialOverlay.tsx`:
```typescript
const tutorialSteps: Record<TutorialStep, {
  title: string;
  message: string;
  icon: React.ReactNode;
  tips?: string[];
}> = {
  // ... step configurations
}
```

## Testing the Tutorial

### Manual Testing Checklist
- [ ] Clear localStorage and reload - tutorial should auto-trigger
- [ ] Complete full tutorial flow - all steps advance correctly
- [ ] Skip tutorial - should mark as completed
- [ ] Replay tutorial - "Replay Tutorial" button works
- [ ] Tutorial overlays don't block critical UI
- [ ] Mobile responsiveness (test on small screens)

### Reset Tutorial for Testing
```javascript
// In browser console:
localStorage.removeItem('quest_tutorial_completed');
location.reload();
```

## Future Enhancements

### Potential Improvements
- [ ] Tutorial for Playground Mode
- [ ] Tutorial for Arena Mode
- [ ] Interactive highlights (arrow pointing to specific UI elements)
- [ ] Video/GIF demonstrations for complex concepts
- [ ] Localization support
- [ ] Difficulty-based tutorial variants
- [ ] Tooltips system for quick help outside tutorial
- [ ] Achievement for completing tutorial

### Advanced Features
- [ ] Contextual help system (? icons throughout app)
- [ ] Progressive disclosure (show advanced features after X encounters)
- [ ] Tutorial analytics (track where users skip/struggle)
- [ ] A/B testing different tutorial flows

## User Feedback Integration

When gathering tester feedback, focus on:
1. **Clarity** - Do users understand each concept?
2. **Pacing** - Is the tutorial too fast/slow?
3. **Skip Rate** - Are users skipping? At what step?
4. **Confusion Points** - Which steps need more explanation?
5. **Engagement** - Does the tutorial feel helpful or tedious?

## Accessibility

The tutorial includes:
- ✅ Keyboard navigation support (Enter/Space to advance)
- ✅ Clear visual hierarchy
- ✅ Readable font sizes (responsive)
- ✅ High contrast text
- ⚠️ **TODO**: Screen reader announcements
- ⚠️ **TODO**: Focus management for overlay

---

**Created for /quest v1.0**
*Making TTRPG storytelling accessible to everyone, one tutorial at a time.*
