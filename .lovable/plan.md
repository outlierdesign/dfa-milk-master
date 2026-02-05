

# With/Without Piper System - Game Mechanics Overhaul

## Overview

This is a major gameplay redesign that creates two distinct game modes:
- **Without Piper**: "Blind" mode - harder, must guess timing based on flow rate
- **With Piper**: Visual feedback mode - can see the tanker filling, but only one shot

Both modes remove the current "easy mode" features (nudging, multiple button presses, live numbers).

---

## New Game Rules (Both Modes)

| Current Behavior | New Behavior |
|------------------|--------------|
| Hold/release button multiple times | **One press only** - start filling, release to stop. No second chances. |
| Nudge button to add 25L increments | **Remove nudge completely** |
| Live litre count during filling | **Hide numbers during fill** - only show at end |
| Spill popup with continue option | **Splat the screen** - game over, show loss |
| Variable flow rate (80-140 L/s) | **Fixed flow rate** with slight variance (±5%) |

---

## New Flow Rate & Time Settings

Based on your specs:
- **Flow rate**: 4,000 lbs/min (real-world Piper capability)
- **Tanker capacity**: 50,000 lbs
- **Time mapping**: 1 second real = 1 minute simulated
- **Target fill time**: ~12.5 seconds (50,000 ÷ 4,000 = 12.5 minutes → 12.5 seconds)
- **Overfill penalty**: 1 second over = 4,000 lbs on ground

For unit flexibility (lbs vs litres):
- 1 litre of milk ≈ 2.27 lbs
- 50,000 lbs ≈ 22,026 litres
- 4,000 lbs/min ≈ 1,762 L/min ≈ 29.4 L/s (displayed)

---

## Mode-Specific Differences

### WITHOUT PIPER (Blind Mode)
| Feature | State |
|---------|-------|
| Progress bar (LoadMeter) | **Hidden** |
| Tanker fill visual | **Opaque** - cannot see inside tank |
| Current fill number | **Hidden** during fill |
| Flow rate display | **Visible** - this is your only clue |
| Target number | **Hidden** |
| Timer | **Visible** - use with flow rate to calculate |

Player must mentally calculate: `Flow Rate × Time = Volume`

### WITH PIPER (Visual Mode)
| Feature | State |
|---------|-------|
| Progress bar (LoadMeter) | **Visible** |
| Tanker fill visual | **Visible** - can see liquid level |
| Current fill number | **Hidden during fill** (shown at end) |
| Flow rate display | **Visible** |
| Target number | **Visible** |
| Flow rate behavior | **Slows down near target** (easier to hit) |

Both modes: Numbers only appear on results screen.

---

## Updated Pre-Load Questions Flow

**Current questions:**
1. "Sampling with Piper?" → YES/NO
2. "Need weighbridge?" → YES/NO

**New questions:**
1. "Are you collecting with a Piper System?" → YES/NO
   - YES = Visual mode with progress bar
   - NO = Blind mode, no visual feedback

Remove the weighbridge question (or make it secondary) since the main gameplay difference is now Piper vs No Piper.

---

## Technical Changes

### 1. Update Game Session State
**File:** `src/game/hooks/useGameStateV2.ts`

Add new tracking fields:
```typescript
interface GameSessionV2 {
  // NEW fields
  usePiperSystem: boolean;  // Main toggle for game mode
  hasStartedFilling: boolean;  // Prevent multiple presses
  fillLocked: boolean;  // After release, cannot restart
}
```

### 2. Modify Filling Logic
**File:** `src/game/hooks/useGameStateV2.ts`

- `startFilling()`: Only works if `!hasStartedFilling`
- `stopFilling()`: Sets `fillLocked = true`, triggers immediate results/splat
- Remove `nudgeFill()` function entirely
- Flow rate: Use constant rate with ±5% variance (not 80-140 range)

### 3. Update Pre-Load Questions
**File:** `src/game/components/PreLoadQuestions.tsx`

Simplify to single primary question:
- "Collecting with a Piper System?" YES/NO
- YES enables visual mode, NO enables blind mode

### 4. Conditionally Hide UI Elements
**File:** `src/game/components/GameScreenV2.tsx`

Based on `session.usePiperSystem`:
```tsx
// Without Piper: Hide these
{session.usePiperSystem && <LoadMeter ... />}
{session.usePiperSystem && (
  <div>TARGET: {target}L</div>
)}

// Always hide current fill during gameplay
// Only show: Flow Rate, Timer
```

### 5. Make Tanker Opaque (Without Piper)
**File:** `src/game/components/TankerV2.tsx`

Add prop `isBlindMode`:
- When true: Hide the inner tank cutaway view, show solid metal tank
- Remove liquid fill animation, target line, all internal elements

### 6. Remove Nudge Button
**File:** `src/game/components/GameScreenV2.tsx`

- Delete nudge button entirely
- Remove nudge-related UI (count display, time penalty warning)

### 7. Add Splat Animation for Overfill
**File:** `src/game/components/SpillAnimation.tsx` (update)

Create dramatic "splat the screen" effect:
- Full screen white/cream splash
- Milk dripping down from top
- "GAME OVER" or "MILK EVERYWHERE!" message
- No continue button - auto-proceeds to results

### 8. Update Config Constants
**File:** `src/game/constantsV2.ts`

```typescript
// New values based on your specs
TANKER_CAPACITY_L: 22_026, // 50,000 lbs equivalent
FLOW_RATE_LPS: 29.4, // 4,000 lbs/min equivalent
FLOW_VARIANCE_PERCENT: 5, // ±5% variance (slight)
TIME_MAPPING_RATIO: 60, // 1 real second = 60 simulated seconds

// Piper mode specific
PIPER_SLOWDOWN_THRESHOLD: 0.90, // Start slowing at 90% fill
PIPER_SLOWDOWN_FACTOR: 0.3, // Reduce to 30% of flow rate
```

### 9. Implement Flow Rate Slowdown (Piper Mode)
**File:** `src/game/hooks/useGameStateV2.ts`

In the fill loop, when `usePiperSystem` and fill > 90%:
```typescript
let effectiveFlowRate = currentFlowRate;
if (session.usePiperSystem && fillPercent > 0.9) {
  const slowFactor = 1 - ((fillPercent - 0.9) / 0.1) * 0.7;
  effectiveFlowRate *= slowFactor;
}
```

### 10. Update Button Logic
**File:** `src/game/components/GameScreenV2.tsx`

Change button behavior:
- First press: "HOLD TO FILL" → starts filling
- Release: Immediately stops AND locks (cannot restart)
- Show "FILLING..." only while held
- After release: "STOPPED" (disabled)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/game/constantsV2.ts` | New flow rate, capacity values, slowdown config |
| `src/game/hooks/useGameStateV2.ts` | Add `usePiperSystem`, `fillLocked`, remove nudge, update flow logic |
| `src/game/components/PreLoadQuestions.tsx` | Simplify to Piper YES/NO question |
| `src/game/components/GameScreenV2.tsx` | Conditional UI hiding, remove nudge button, update button logic |
| `src/game/components/TankerV2.tsx` | Add blind mode (opaque tank) |
| `src/game/components/LoadMeter.tsx` | No changes, just conditionally rendered |
| `src/game/components/SpillAnimation.tsx` | Add dramatic splat effect |
| `src/game/FillTheTank.tsx` | Update props passed to components |
| `src/game/components/AdminPanel.tsx` | Update settings for new config values |

---

## Gameplay Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    PRE-LOAD QUESTION                        │
│         "Collecting with a Piper System?"                   │
│                                                             │
│           ┌─────────┐         ┌─────────┐                   │
│           │   YES   │         │   NO    │                   │
│           └────┬────┘         └────┬────┘                   │
│                │                   │                        │
│                ▼                   ▼                        │
│      ┌────────────────┐   ┌────────────────┐                │
│      │  VISUAL MODE   │   │   BLIND MODE   │                │
│      │                │   │                │                │
│      │ • See progress │   │ • Opaque tank  │                │
│      │ • See target   │   │ • No progress  │                │
│      │ • Flow slows   │   │ • No target #  │                │
│      │   near end     │   │ • Flow + Timer │                │
│      │                │   │   only         │                │
│      └────────────────┘   └────────────────┘                │
│                                                             │
│              BOTH MODES:                                    │
│              • ONE button press only                        │
│              • Release = Stop permanently                   │
│              • No nudge                                     │
│              • Numbers shown at END only                    │
│              • Overfill = SPLAT → Results                   │
└─────────────────────────────────────────────────────────────┘
```

---

## User Experience Impact

**Without Piper** (Hard Mode):
- Player sees: Flow rate (e.g., "29 L/s") and timer
- Must calculate: "29 L/s × 12.5s = 362.5L... wait that's not right..."
- Challenge: Mental math under pressure with no visual confirmation

**With Piper** (Easier Mode):
- Player sees: Tank filling, progress bar, flow slowing near target
- Still challenging: One shot, no nudges, flow rate changes
- Advantage: Visual feedback shows when to stop

This creates a clear "aha!" moment: "With Piper, I can actually see what I'm doing!"

