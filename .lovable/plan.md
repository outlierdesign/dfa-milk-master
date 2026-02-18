
## Problem: Timer Shows Real Seconds Instead of Simulated 12-Minute Time

### Root Cause Identified

The `AdminPanel.tsx` `SpeedSelector` component only offers four preset buttons: **1×, 2×, 5×, 10×**. The game default is **48×**, but this option does not exist in the UI.

Every time a user opens the Admin Panel and clicks "Save & Apply", the `SpeedSelector` highlights the closest matching button (likely `10×`), and `localStorage` writes `10` as the `gameSpeedMultiplier`. This overrides the `48` default permanently.

With a multiplier of `10`, a 15-second real fill shows `02:30` instead of `12:00`.

The timer logic itself is correct — it multiplies elapsed seconds by `speedMultiplier`:
```
setElapsedTime(((performance.now() - fillStartTime) / 1000) * speedMultiplier)
```
The flow loop in `useGameStateV2.ts` also correctly applies `speedMultiplier` to the fill delta. So the only issue is the cached wrong value.

---

### Fix — Two Changes

**1. Add 48× to the Speed Selector options**

Update `SPEED_OPTIONS` in `AdminPanel.tsx` to include the 48× trade show option:

```
{ value: 1,  label: "1×",  description: "Real-time" },
{ value: 10, label: "10×", description: "~1.5 min" },
{ value: 24, label: "24×", description: "~6 min" },
{ value: 48, label: "48×", description: "~12 min" },
```

This makes 48× selectable and clearly labelled, so saving the panel will correctly persist `48`.

**2. Bump storage key to v5 and clear v4 cache**

Update `STORAGE_KEY` from `v4` → `v5` and add `v4` to the `OLD_KEYS` cleanup list. This wipes any previously cached wrong multiplier value (e.g. `10`) from localStorage and forces a fresh load from `GAME_DEFAULTS` (which has `gameSpeedMultiplier: 48`).

---

### Files to Change

- `src/game/components/AdminPanel.tsx`
  - `STORAGE_KEY` → `"fill-tank-admin-settings-v5"`
  - Add `"fill-tank-admin-settings-v4"` to `OLD_KEYS`
  - Replace `SPEED_OPTIONS` array with 1×, 10×, 24×, 48× options

No other files need to change. The timer logic, flow loop, and defaults are all correct — only the Admin Panel UI was missing the 48× preset, causing the wrong value to be cached.
