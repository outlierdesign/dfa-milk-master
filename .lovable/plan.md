
# Three Game Mechanic Fixes

## 1. Timer Shows Real Wall-Clock Time

### Current Behaviour
The `GameTimer` multiplies elapsed real seconds by `speedMultiplier` (48), so 15 real seconds of filling shows as "12:00". This was intended to represent real-world load time but makes the in-game experience confusing.

### Requested Behaviour
Show the actual real seconds elapsed during the fill (e.g. 15 seconds of button-holding shows as "00:15"). The 20-minute agitation and 15-minute weighbridge penalties remain shown as fixed additions beside the fill time — they represent the real-world costs of those activities and don't change.

### Fix
In `GameTimer.tsx`, remove the `speedMultiplier` multiplication from the elapsed time calculation:

```ts
// BEFORE
const update = () => setElapsedTime(((performance.now() - fillStartTime) / 1000) * speedMultiplier);

// AFTER
const update = () => setElapsedTime((performance.now() - fillStartTime) / 1000);
```

The `speedMultiplier` badge in the timer header can also be removed since it no longer affects the displayed value.

The `fillDuration` stored in round results (used by scoring) also currently applies the multiplier in `completeLoad()`. This must stay as simulated minutes for the scoring engine to be accurate — so **no change** is needed there. The cost engine already uses `agitationMinutes` (20) and `weighScaleMinutes` (15) as fixed values, independent of fill duration display.

---

## 2. Overfill Mechanic: 4,000 lbs Tolerance + Release-to-Stop Jeopardy

### Current Behaviour
`maxOverfillLbs` is set to **4 lbs** (essentially zero tolerance). The game auto-stops filling the instant 50,004 lbs is reached, showing the spill animation. This means there's almost no jeopardy window between target and hard stop.

### Requested Behaviour
- Players can overfill up to **4,000 lbs** beyond the 50,000 lb target (54,000 lbs total)
- The spill animation and lock fires at 54,000 lbs (hard cap)
- **OR** when the player releases the button at any point above 50,000 lbs — creating genuine jeopardy: "do I release now or risk going higher?"
- The spill popup/animation should trigger on release-above-target, just as it does on hard-cap

### Fix

**`constantsV2.ts`** — Change `maxOverfillLbs`:
```ts
// BEFORE
maxOverfillLbs: 4,

// AFTER
maxOverfillLbs: 4_000,
```

This changes `maxAllowedFill` to 54,000 lbs (computed as `targetLoadLbs + maxOverfillLbs`).

**`useGameStateV2.ts`** — Update `stopFilling` so that when the player releases above target, `showSpillPopup` is set to `true` (currently it only sets it for `spillTriggered`, which only fires at the hard 4-lb cap):

```ts
// BEFORE
const stopFilling = useCallback(() => {
  if (!isFilling) return;
  setIsFilling(false);
  setSession((prev) => ({
    ...prev,
    fillLocked: true,
    fillEndTime: performance.now(),
    showSpillPopup: prev.spillTriggered && prev.spillAmount > 0,
  }));
}, [isFilling]);

// AFTER
const stopFilling = useCallback(() => {
  if (!isFilling) return;
  setIsFilling(false);
  setSession((prev) => ({
    ...prev,
    fillLocked: true,
    fillEndTime: performance.now(),
    // Show spill popup if ANY overfill occurred (not just hard-cap trigger)
    showSpillPopup: prev.spillAmount > 0,
    // Mark spillTriggered visually if they released above target
    spillTriggered: prev.spillTriggered || prev.spillAmount > 0,
  }));
}, [isFilling]);
```

**`SpillAnimation`** — Currently only renders when `isActive && spillAmount > 0`. This already covers the case where player releases above target since we'll set `spillTriggered = true` on release. No changes needed here.

**`GameScreenV2.tsx`** — The "OVERFILLED!" button state text and the spill message box need to reflect the new larger tolerance. Currently shows:

```tsx
if (session.spillTriggered) return { disabled: true, text: "💥 OVERFILLED!", ... };
```

This is already correct — it only shows after the fill is locked. No change needed.

The post-fill summary box already shows the spill amount in lbs:
```tsx
{session.fillLocked && session.spillAmount > 0 && (
  <div>💥 {Math.round(session.spillAmount).toLocaleString()} lbs OVER</div>
)}
```
This will now correctly show values up to 4,000 lbs.

---

## Files to Change

| File | Change |
|---|---|
| `src/game/constantsV2.ts` | `maxOverfillLbs: 4` → `maxOverfillLbs: 4_000` |
| `src/game/components/GameTimer.tsx` | Remove `× speedMultiplier` from elapsed time display |
| `src/game/hooks/useGameStateV2.ts` | Update `stopFilling` to set `showSpillPopup` and `spillTriggered` when releasing above target |

No logic changes to the scoring engine — `fillDuration` remains in simulated seconds, agitation/weighbridge costs remain fixed at 20/15 minutes. The timer display change is purely cosmetic.

## Player Experience After Fix

| Scenario | Timer shows | Overfill |
|---|---|---|
| Perfect 15-second fill | "00:15" | None |
| Player releases at 51,000 lbs | "00:13" | Spill popup: 1,000 lbs over = $190 lost |
| Player releases at 53,500 lbs | "00:14" | Spill popup: 3,500 lbs over = $665 lost |
| Player hits hard cap (54,000 lbs) | "00:15+" | Full splat animation auto-fires |
| Agitation penalty (no Piper) | shown as "+20:00" | Independent of fill time |
| Weighbridge penalty | shown as "+15:00" | Independent of fill time |
