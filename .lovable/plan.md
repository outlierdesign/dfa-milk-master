
# Dramatic Penalty Reveal Animation

## Overview

Add an intermediate "penalty reveal" phase between clicking "Done" and showing the results screen. This creates a dramatic reveal where each penalty animates onto the screen and adds to the total time, emphasizing the cost impact of player decisions.

---

## Animation Flow

When player clicks "DONE - COMPLETE LOAD":

```text
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: Freeze + Darken                       │
│  Game screen darkens, timer freezes, dramatic pause              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (0.5s)
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 2: Show Base Time                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              ⏱️ LOAD COMPLETE                              │  │
│  │                                                            │  │
│  │              Fill Time: 00:12.4                            │  │
│  │              ──────────────────                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (1s)
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 3: Penalties Animate In                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Fill Time: 00:12.4                            │  │
│  │                                                            │  │
│  │     [slide in + shake]   + 20:00  Agitation Required  ⚠️  │  │
│  │     [slide in + shake]   + 10:00  Weighbridge Stop    ⚠️  │  │
│  │     [fade in]            + 00:04  Nudges (2× 2s)      ⏱️  │  │
│  │              ──────────────────                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (0.5s each penalty)
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 4: Total Reveal                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Fill Time: 00:12.4                            │  │
│  │                                                            │  │
│  │              + 20:00  Agitation Required                   │  │
│  │              + 10:00  Weighbridge Stop                     │  │
│  │              + 00:04  Nudges                               │  │
│  │              ══════════════════                            │  │
│  │                                                            │  │
│  │     [pulse + scale]    TOTAL: 30:16.4  💸 €120.13         │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (2s)
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 5: Transition to Results                 │
│  Screen fades to results screen with full breakdown              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Approach

### New Game State

Add a new intermediate state to handle the penalty reveal phase:

**Current states:** `attract` → `questions` → `playing` → `results`

**New flow:** `attract` → `questions` → `playing` → `penaltyReveal` → `results`

### New Component: `PenaltyRevealScreen.tsx`

A dedicated overlay/screen that:
1. Shows darkened game background
2. Displays animated penalty reveal sequence
3. Auto-transitions to results after animation completes

**Component Structure:**
- Uses `useState` to track animation phase (0-4)
- Uses `useEffect` with `setTimeout` to sequence animations
- Each penalty slides in from the right with a slight shake
- Total calculates live as penalties add
- Final total pulses with cost conversion

### Animation Timeline

| Phase | Duration | Action |
|-------|----------|--------|
| 0 | 0ms | Initial - show "LOAD COMPLETE" title |
| 1 | 500ms | Show base fill time |
| 2 | 500ms × N | Each penalty slides in (staggered) |
| 3 | 1000ms | Total reveals with pulse animation |
| 4 | 1500ms | Hold, then fade to results |

Total animation time: ~4-5 seconds depending on number of penalties

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/game/components/PenaltyRevealScreen.tsx` | New animated penalty reveal component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/game/constantsV2.ts` | Add `"penaltyReveal"` to `GameStateV2` type |
| `src/game/hooks/useGameStateV2.ts` | Change `completeLoad` to go to `penaltyReveal` state first, add `showResults()` action to transition to results |
| `src/game/FillTheTank.tsx` | Add rendering for `penaltyReveal` state with new component |

---

## Technical Details

### State Updates to `useGameStateV2.ts`

```typescript
// Change completeLoad to go to penalty reveal first
const completeLoad = useCallback(() => {
  setIsFilling(false);
  // ... calculate final values ...
  setGameState("penaltyReveal"); // Changed from "results"
}, []);

// New action to transition from penalty reveal to results
const showResults = useCallback(() => {
  setGameState("results");
}, []);
```

### PenaltyRevealScreen Props

```typescript
interface PenaltyRevealScreenProps {
  fillDuration: number;           // seconds of actual filling
  usePiperSampling: boolean;
  useWeighbridge: boolean;
  nudgeCount: number;
  config: GameConfig;
  onComplete: () => void;         // Called when animation finishes
}
```

### Animation CSS Classes

Will use Tailwind's built-in animations plus custom keyframes:
- `animate-slide-in-right` - Penalty rows slide from right
- `animate-pulse` - Total time emphasis
- `animate-scale-in` - Final total reveal
- Custom shake animation for penalty impact feel

### Penalty Row Animation

Each penalty appears with:
1. Slide in from right (300ms)
2. Brief shake/impact effect (200ms)
3. Running total updates
4. Sound effect hook ready (for future)
