
# Fix Load Time to Reflect Simulated Real-World Time

## Problem

When the game speed is set to 2x, 5x, or 10x via the admin panel, the "Load Time" shown on the results screen displays the actual wall-clock time (e.g., 11.0s) rather than the simulated real-world time it would represent (e.g., 55.0s at 5x speed).

The `GameTimer` component already correctly applies the speed multiplier for real-time display during gameplay, but the final duration stored and displayed on results screens is not adjusted.

## Current Flow

```
Wall-clock time: 11 seconds
Speed multiplier: 5x
Fill rate: Applied at 5x speed (fills tank faster)

Current Result Display: "Load Time: 11.0s" (incorrect)
Expected Result Display: "Load Time: 55.0s" (represents real-world equivalent)
```

## Solution

Apply the speed multiplier when calculating `totalFillDuration` in the `completeLoad` function, so the stored value represents simulated real-world time.

---

## Technical Changes

### File: `src/game/hooks/useGameStateV2.ts`

Update the `completeLoad` function to apply the speed multiplier to the duration calculation:

**Current (lines 307-310):**
```typescript
// Calculate total fill duration
const endTime = prev.fillEndTime ?? performance.now();
const startTime = prev.fillStartTime ?? endTime;
const totalFillDuration = (endTime - startTime) / 1000; // Convert to seconds
```

**Updated:**
```typescript
// Calculate total fill duration - apply speed multiplier to represent real-world time
const endTime = prev.fillEndTime ?? performance.now();
const startTime = prev.fillStartTime ?? endTime;
const speedMultiplier = configRef.current.GAME_SPEED_MULTIPLIER || 1;
const totalFillDuration = ((endTime - startTime) / 1000) * speedMultiplier; // Simulated real-world seconds
```

---

### File: `src/game/components/PenaltyRevealScreen.tsx`

This screen also shows the fill duration and should already work correctly once the source data is fixed. However, it also has a hardcoded `€` currency symbol on line 215 that should use the config currency for consistency.

**Current (line 215):**
```typescript
€{totalCost.toFixed(2)} time cost
```

**Updated:**
```typescript
{config.CURRENCY}{totalCost.toFixed(2)} time cost
```

---

## Summary

| File | Change |
|------|--------|
| `src/game/hooks/useGameStateV2.ts` | Apply `GAME_SPEED_MULTIPLIER` to `totalFillDuration` calculation |
| `src/game/components/PenaltyRevealScreen.tsx` | Fix hardcoded `€` to use `config.CURRENCY` |

---

## Result

After this change:
- At **1x speed**: 11 seconds wall-clock = 11 seconds displayed
- At **5x speed**: 11 seconds wall-clock = 55 seconds displayed (simulated real-world time)
- At **10x speed**: 11 seconds wall-clock = 110 seconds displayed

This ensures the displayed time represents the actual duration a real tanker load would take, making the cost calculations and time penalties meaningful for trade show demonstrations.
