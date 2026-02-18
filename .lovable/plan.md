
## Problem Summary

The in-game timer still shows real seconds (e.g. `00:06.4`) instead of simulated minutes (e.g. `06:24`) because the `v5` localStorage key was written with the wrong speed multiplier value **before** the fix was applied — so the stale `v5` entry is being read back on load and overriding the `48×` default.

Additionally, the Admin Panel has a slider for "Max Overfill" with a minimum of 1,000 lbs, but the default was recently changed to 200 lbs — meaning the slider can never actually be set to 200 lbs, and any save from the Admin Panel will snap it up to 1,000 and overwrite the correct default.

## Root Causes

**1. Stale v5 cache**
`STORAGE_KEY` is `v5`. When the v5 fix was deployed, if the user's browser had already loaded the page and saved settings with a wrong multiplier, that bad `v5` value persists. Bumping to `v6` and adding `v5` to `OLD_KEYS` will wipe it.

**2. Max Overfill slider min is wrong**
The `NumberSetting` for `maxOverfillLbs` has `min={1000}`, but the default is `200`. Every time the Admin Panel is saved, the slider clamps to 1,000 lbs — breaking the 200 lb spill threshold entirely. This needs `min={50} step={50}`.

## Changes — One File Only

**`src/game/components/AdminPanel.tsx`**

1. Bump `STORAGE_KEY` → `"fill-tank-admin-settings-v6"`
2. Add `"fill-tank-admin-settings-v5"` to `OLD_KEYS` array
3. Fix `maxOverfillLbs` slider: change `min={1000} max={30000} step={500}` → `min={50} max={2000} step={50}`

## What This Achieves

- Stale cached speed multiplier is wiped; game loads fresh with `gameSpeedMultiplier: 48` from `GAME_DEFAULTS`
- A 15-second real fill will display as ~`12:00` on the load timer
- The 200 lb spill threshold (which triggers the "milk everywhere" animation) is preserved correctly when the Admin Panel is saved
- All penalty/results calculations continue to use the simulated 12-minute figure as intended
