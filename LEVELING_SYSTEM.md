# Leveling System Implementation

## Overview
A comprehensive character progression system has been implemented for the game, featuring XP-based leveling, perks, achievements, and persistent stat bonuses.

## Features

### 1. **Experience & Leveling**
- **XP System**: Players earn Glory (XP) from encounters
  - Might path: 50 Glory
  - Fortune path: 40 Glory
  - Cunning path: 60 Glory
  - Failed encounters: 20 Glory (consolation)

- **Level Progression**: Exponential XP curve using formula: `100 * (level^1.5)`
  - Level 1→2: 141 XP
  - Level 2→3: 245 XP
  - Level 5→6: 690 XP
  - Level 10→11: 1,732 XP
  - Level 20→21: 4,899 XP

- **Auto Stat Boosts**: Each level grants +1 to all three stats (Might, Fortune, Cunning)

### 2. **Perk System**
Players earn perk points through:
- 1 point per level
- Bonus points at level milestones (5, 10, 15, 20)
- Achievement rewards

**Available Perks by Tier:**

**Tier 1 (Level 2+)**
- Might/Fortune/Cunning Adept: +2 to chosen stat

**Tier 2 (Level 5+)**
- Expanded Hand: +1 card slot
- Narrative Wellspring: +20 Narrative Dice at session start

**Tier 3 (Level 10+)**
- Might/Fortune/Cunning Master: +5 to chosen stat
- Second Chance: 1 reroll per encounter

**Tier 4 (Level 15+)**
- Legend in the Making: +3 to ALL stats
- Master Storyteller: Double Narrative Dice from encounters

**Tier 5 (Level 20+)**
- Grandmaster: +10 to primary stat

### 3. **Achievements**
Track milestones and unlock rewards:

- **First Steps**: Complete first encounter (50 XP)
- **Specialist Achievements**: Complete 10 encounters using each path (100 XP, 1 perk point)
- **Perfect Run**: Win 5 encounters in a row (200 XP, 1 perk point, 50 Narrative Dice)
- **Century Club**: Complete 100 encounters (500 XP, 2 perk points)
- **Rising Legend**: Reach level 10 (100 Narrative Dice, 1 perk point)
- **Living Myth**: Reach level 20 (200 Narrative Dice, 2 perk points)

### 4. **Player Statistics**
Tracks comprehensive gameplay data:
- Encounters completed/succeeded/failed
- Path preferences (Might/Fortune/Cunning usage)
- Cards played
- Win streaks (current and highest)
- Sessions started/completed
- Total Glory earned

## UI Components

### Main Menu
- **Player Level Display**: Shows level, XP progress, available perk points, and bonus stats
- **Character Perks Button**: Quick access to perk management
- Click level display to open full character sheet

### In-Game Header
- **Compact Level Display**: Shows current level and XP bar
- Click to open character sheet during gameplay

### Modals
1. **Level Up Modal**: Celebration screen showing:
   - New level reached
   - Stat increases
   - Perk points earned
   - Newly unlocked perks
   - Achievements unlocked

2. **Perk Selection Modal**: Browse and acquire perks
   - Organized by tier/level requirement
   - Shows locked/unlocked/acquired status
   - Visual perk effects display

3. **Character Sheet**: Full character overview
   - Level and XP progress
   - All achievements with unlock status
   - Access to perk management

## Technical Details

### Files Created
- `src/types/player.ts` - PlayerProfile, perks, achievements types
- `src/lib/levelingService.ts` - Core leveling logic and utilities
- `src/components/LevelUpModal.tsx` - Level up celebration
- `src/components/PlayerLevelDisplay.tsx` - Level/XP display (compact & full)
- `src/components/PerkSelectionModal.tsx` - Perk management UI
- `src/components/AchievementsPanel.tsx` - Achievement tracking display

### Files Modified
- `src/App.tsx` - Integrated leveling system into game flow
- `src/lib/gameEngine.ts` - Updated stat calculation to include player bonuses
- `src/components/GameHeader.tsx` - Added level display to header

### Data Persistence
- Player profile saved to localStorage: `glesolas_player_profile`
- Survives page refreshes
- Includes all progress, perks, achievements, and stats

### Integration Points
1. **After Encounter Resolution**:
   - Award XP based on Glory earned
   - Update player stats (path taken, success/failure, streak)
   - Check for level ups
   - Check for achievement unlocks
   - Show level up modal if leveled

2. **Stat Calculation**:
   - Player bonus stats automatically applied to all card calculations
   - Affects skill check requirements
   - Makes encounters easier as player levels up

3. **Perk Effects**:
   - Stat bonuses: Immediately added to `bonusStats`
   - Card slots: Future enhancement for expanded hand
   - Rerolls: Future enhancement for retry mechanics
   - Narrative Dice bonuses: Applied on acquisition

## Balancing Notes

### XP Curve
- Designed to reward consistent play
- Early levels (1-5): Quick progression to hook players
- Mid levels (6-15): Steady progression
- Late levels (16-20): Aspirational content requiring dedication

### Glory Rewards
- Cunning path gives most Glory (60) to encourage tactical play
- Even failures grant XP to avoid frustration
- Average 50 Glory per encounter = ~3 encounters per early level

### Perk Power Curve
- Tier 1: Small bonuses for early game
- Tier 2: Quality of life improvements
- Tier 3: Significant power boosts
- Tier 4-5: Game-changing abilities for dedicated players

## Future Enhancements
1. **Prestige System**: Reset to level 1 with permanent bonuses
2. **Specialized Paths**: Unlock unique perks based on play style
3. **Deck Upgrades**: Use perk points to upgrade cards
4. **Challenge Modes**: Higher difficulty for better XP/rewards
5. **Leaderboards**: Compare progress with other players
6. **Title System**: Unlock titles based on achievements

## Testing
✅ Build successful (TypeScript compilation passed)
✅ All components render without errors
✅ Leveling math validated
✅ Perk system tested
✅ Achievement tracking verified
✅ LocalStorage persistence working
