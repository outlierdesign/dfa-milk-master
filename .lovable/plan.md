
## Two Bugs — Root Causes Found

### Bug 1: Fill completes in ~0.25 real seconds instead of ~15 seconds (timer issue)

The fill rate formula in `useGameStateV2.ts` has a **unit mismatch**. The flow rate is in **lbs per minute**, but `deltaTime` is in **seconds**. There is no `/60` conversion to turn seconds into minutes before multiplying:

```
// CURRENT (wrong):
const fillDelta = effectiveFlowRate * deltaTime * speedMultiplier;
// e.g. 4167 lbs/min * 0.016 seconds * 48 = 3,200 lbs per 16ms tick

// CORRECT:
const fillDelta = effectiveFlowRate * (deltaTime / 60) * speedMultiplier;
// e.g. 4167 lbs/min * (0.016/60) min * 48 = 53 lbs per 16ms tick
```

**Impact of the bug:**
- Each 16ms frame currently adds ~3,200 lbs
- 50,000 lbs fills in ~0.25 real seconds (the "1 second" the user experiences)
- The overfill cap (2,000 lbs) is blown past instantly, auto-stopping before the player can react
- The timer shows ~26 simulated seconds because 0.56 real seconds × 48 = 26.7

**With the fix:**
- Each 16ms frame adds ~53 lbs
- 50,000 lbs fills in ~15 real seconds ✓
- Timer counts up toward 12:00 over that 15 seconds ✓
- Players have time to manually stop, choosing their fill amount

---

### Bug 2: "MILK EVERYWHERE!" overlay blocks advancing after a spill

In `FillTheTank.tsx`, the `SpillAnimation` component receives `isActive={session.spillTriggered}`. Once a spill triggers, `spillTriggered` is set to `true` and **never resets** within the round. So even after the 3-second auto-dismiss fires `acknowledgeSpill` (which sets `spillAcknowledged: true`), the `isActive` prop remains `true` and the overlay stays on screen, visually obscuring the "NEXT ROUND →" button.

**Fix:** Change the `isActive` prop to `session.spillTriggered && !session.spillAcknowledged` so the overlay correctly hides once the player has acknowledged the spill.

---

## Changes Required

### File 1: `src/game/hooks/useGameStateV2.ts`
- Line 134: Change `effectiveFlowRate * deltaTime * speedMultiplier` to `effectiveFlowRate * (deltaTime / 60) * speedMultiplier`

### File 2: `src/game/FillTheTank.tsx`
- Change `isActive={session.spillTriggered}` to `isActive={session.spillTriggered && !session.spillAcknowledged}` on the `SpillAnimation` component inside `GameScreenV2`

Wait — `SpillAnimation` is rendered inside `GameScreenV2`, not `FillTheTank`. Looking at `GameScreenV2.tsx` line 79-84:
```jsx
<SpillAnimation
  spillAmount={session.spillAmount}
  isActive={session.spillTriggered}
  config={config}
  onContinue={onAcknowledgeSpill}
/>
```

### File 2 (corrected): `src/game/components/GameScreenV2.tsx`
- Change `isActive={session.spillTriggered}` to `isActive={session.spillTriggered && !session.spillAcknowledged}`

---

## Summary of Expected Behaviour After Fixes

| Scenario | Before | After |
|---|---|---|
| Fill duration (real) | ~0.25 seconds | ~15 seconds |
| Timer at end of fill | ~00:26 simulated | ~12:00 simulated |
| Overfill experience | Instant auto-stop, no reaction time | Gradual — warning shown, player can choose to stop |
| After spill animation | "MILK EVERYWHERE" stays forever | Overlay hides after 3 seconds, "NEXT ROUND →" is accessible |

Both fixes are minimal and surgical — one line each.
