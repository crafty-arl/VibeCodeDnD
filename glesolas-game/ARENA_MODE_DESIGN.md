# GLESOLAS Arena Mode - Quick Battle Challenge

## Overview
Arena Mode is a **fast, focused, single-encounter** game mode perfect for quick sessions. It's the "arcade mode" of GLESOLAS - designed for:

- ⚡ **5-minute sessions**
- 🏆 **High score challenges**
- 🎯 **Deck testing**
- 🔥 **Daily challenges**

---

## Core Concept

**One encounter. One chance. Maximum glory.**

Unlike Campaign (infinite) or Playground (narrative-driven), Arena Mode is about:
- **Speed**: Complete a challenge in under 5 minutes
- **Optimization**: Perfect your deck and strategy
- **Competition**: Leaderboard and daily challenges

---

## Mechanics

### Challenge Types

1. **Standard Arena**
   - Random high-difficulty challenge
   - Use any deck
   - Score based on: glory gained + path diversity + speed

2. **Daily Challenge**
   - Same challenge for all players (24 hours)
   - Fixed deck or random cards
   - Global leaderboard

3. **Gauntlet** (Future)
   - 3 challenges in a row
   - No hand refresh between
   - Cumulative scoring

---

## Scoring System

```typescript
export interface ArenaScore {
  challengeId: string;
  glory: number;           // Base glory from challenge
  timeBonus: number;       // Faster = more points
  pathBonus: number;       // Using harder path = more points
  perfectionBonus: number; // All stats exceeded requirements
  totalScore: number;
}

// Score calculation
function calculateArenaScore(result: RollResult, timeSeconds: number): number {
  let score = result.gloryGained;

  // Time bonus (under 30s = max bonus)
  if (timeSeconds < 30) score += 100;
  else if (timeSeconds < 60) score += 50;
  else if (timeSeconds < 120) score += 25;

  // Path bonus (cunning > fortune > might)
  if (result.path === 'cunning') score += 75;
  else if (result.path === 'fortune') score += 50;
  else if (result.path === 'might') score += 25;

  // Perfection bonus (exceeded all requirements)
  if (isPerfect(result)) score += 150;

  return score;
}
```

---

## UI Flow

### Arena Home
```
┌────────────────────────────────┐
│  ⚔️ ARENA MODE                 │
├────────────────────────────────┤
│  Quick Battle Challenge        │
│                                │
│  ┌──────────────────────────┐ │
│  │ 🎲 STANDARD ARENA        │ │
│  │ Random challenge         │ │
│  │ Best Score: 1,250        │ │
│  │ [▶ Fight!]               │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ ⭐ DAILY CHALLENGE       │ │
│  │ "The Cursed Scroll"      │ │
│  │ Resets in: 8h 23m        │ │
│  │ Top Score: 2,100         │ │
│  │ Your Best: 1,850         │ │
│  │ [▶ Challenge!]           │ │
│  └──────────────────────────┘ │
│                                │
│  📊 Leaderboard (Today)        │
│  1. xXDiceLordXx - 2,100      │
│  2. RollMaster - 1,975        │
│  3. You - 1,850               │
└────────────────────────────────┘
```

### Battle Screen
```
┌────────────────────────────────┐
│  ⏱️ 00:23  |  Arena Challenge  │
├────────────────────────────────┤
│  [Challenge Scene]             │
│  Requirements: M:8 F:7 C:9     │
│                                │
│  [Select 3 Cards from Hand]    │
│  Your Stats: M:? F:? C:?       │
│                                │
│  [Choose Path → Get Score]     │
└────────────────────────────────┘
```

### Results
```
┌────────────────────────────────┐
│  🏆 ARENA COMPLETE!            │
├────────────────────────────────┤
│  Challenge: "Cursed Scroll"    │
│  Time: 00:42                   │
│  Path: Cunning ✓               │
│                                │
│  Score Breakdown:              │
│  ├─ Glory: 60                  │
│  ├─ Time Bonus: 50             │
│  ├─ Path Bonus: 75             │
│  ├─ Perfection: 150            │
│  └─ TOTAL: 335                 │
│                                │
│  🎉 New Personal Best!         │
│  Previous: 285                 │
│                                │
│  Leaderboard: #12 (Global)     │
│                                │
│  [🔄 Retry] [🏠 Home]          │
└────────────────────────────────┘
```

---

## Technical Implementation (Lean)

```typescript
// types/arena.ts
export interface ArenaChallenge {
  id: string;
  type: 'standard' | 'daily';
  scene: string;
  requirements: { might_req: number; fortune_req: number; cunning_req: number };
  difficultyModifier: number;
  expiresAt?: number; // For daily challenges
}

export interface ArenaResult {
  challengeId: string;
  score: number;
  time: number;
  path: SkillPath;
  cards: string[]; // Card IDs used
  timestamp: number;
}

// lib/arenaEngine.ts
export class ArenaEngine {
  static generateChallenge(): ArenaChallenge {
    return {
      id: generateId(),
      type: 'standard',
      scene: getRandomChallenge().scene,
      requirements: {
        might_req: randomInt(6, 10),
        fortune_req: randomInt(6, 10),
        cunning_req: randomInt(6, 10),
      },
      difficultyModifier: 3,
    };
  }

  static calculateScore(result: RollResult, timeMs: number): ArenaResult {
    const timeSeconds = timeMs / 1000;
    let score = result.gloryGained;

    // Time bonus
    if (timeSeconds < 30) score += 100;
    else if (timeSeconds < 60) score += 50;
    else if (timeSeconds < 120) score += 25;

    // Path bonus
    const pathBonus = { might: 25, fortune: 50, cunning: 75 };
    score += pathBonus[result.path] || 0;

    return {
      challengeId: 'arena-' + Date.now(),
      score,
      time: timeSeconds,
      path: result.path,
      cards: [],
      timestamp: Date.now(),
    };
  }

  static saveHighScore(result: ArenaResult): void {
    const currentBest = localStorage.getItem('arena_best_score');
    if (!currentBest || result.score > Number(currentBest)) {
      localStorage.setItem('arena_best_score', String(result.score));
      localStorage.setItem('arena_best_result', JSON.stringify(result));
    }
  }
}
```

This is a minimal, lean mode - no complex branching, just pure score-chasing gameplay.
