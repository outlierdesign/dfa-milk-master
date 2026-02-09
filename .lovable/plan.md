

# Re-integrate Overfill Effects, Transparent Tanker, Remove Piper Question

## Overview

Three changes to simplify the game flow and enhance the overfill experience:

1. **Full-screen milk spill animation with red flashing** -- already exists in `SpillAnimation.tsx` but needs to be more prominent with a red screen flash effect added
2. **Always show transparent tanker** -- remove the `isBlindMode` prop so the fill level is always visible
3. **Remove the Piper/Blind mode question** -- skip the `questions` state entirely, go straight from `attract` to `playing`

---

## Changes

### 1. Skip the Questions Screen

**File: `src/game/hooks/useGameStateV2.ts`**
- Change `startGame` to go directly to `"playing"` instead of `"questions"`
- Set default session values: `usePiperSampling: false`, `useWeighbridge: true`
- Remove the `completeQuestions` callback (or keep it unused)
- Initialise `currentFlowRate` with a random flow rate in `startGame`

**File: `src/game/FillTheTank.tsx`**
- Remove the `questions` state rendering block
- Remove the `PreLoadQuestions` import

### 2. Transparent Tanker (Always Visible Fill)

**File: `src/game/components/GameScreenV2.tsx`**
- Remove `isBlindMode={!usePiper}` prop from `TankerV2` (or set it to `false`)
- Always show the `LoadMeter` (remove the `usePiper &&` condition)
- Always show the TARGET stat box (remove the `usePiper &&` condition)
- Remove the "Blind mode hint" section
- Remove the "Visual Mode / Blind Mode" subtitle text
- Keep flow rate display and timer

### 3. Enhance Spill Animation with Red Flash

**File: `src/game/components/SpillAnimation.tsx`**
- Add a red screen flash/pulse overlay that flashes rapidly when overfill triggers
- Add a pulsing red border effect around the entire screen
- Keep existing milk splat, drips, and spots
- Keep the central "MILK EVERYWHERE" message card

### 4. Remove Piper Slowdown from Fill Loop

**File: `src/game/hooks/useGameStateV2.ts`**
- Remove the Piper slowdown logic block in the fill interval (lines 132-142) since Piper mode is no longer used
- Flow rate stays constant (with jitter only)

---

## Summary of State Flow Change

```text
BEFORE: attract -> questions -> playing -> roundResult -> ...
AFTER:  attract -> playing -> roundResult -> ...
```

No changes to scoring engine, admin panel, leaderboard, or results screens.

