

# Fix Milk Color, Farm Tank Capacity, and Overfill Limit

## Overview

Three changes based on your requirements:

1. **Milk stays cream-colored** -- currently the tanker fill changes to green (near target) and orange/amber (close to target), which is unrealistic. It should always be cream/milk white.
2. **Farm tank holds 260,000 lbs** -- currently calculated as `targetLoad * 1.15` (57,500 lbs). Needs to be 260,000 lbs and visually drain by ~50,000 lbs per round.
3. **Max overfill is 4 lbs** -- currently set to 12,000 lbs. The player can overfill up to 4 lbs before the hard stop.

---

## Changes

### 1. Keep Milk Always Cream-Colored

**File: `src/game/components/TankerV2.tsx`**
- Remove the conditional color logic (lines 31-36) that changes `fillColor` to green or amber based on proximity to target
- Always use `from-[#FDFFF5] to-[#F5F7E8]` (cream white) for the fill
- Keep the red overfill indicator as a separate overlay element rather than changing the milk color itself

**File: `src/game/components/LoadMeter.tsx`**
- No changes needed here -- the load meter bar is a UI indicator (not milk), so color feedback (green/amber/red) is appropriate

### 2. Farm Tank = 260,000 lbs, Drains Per Round

**File: `src/game/components/GameScreenV2.tsx`**
- Change `farmTankCapacity` from `config.targetLoadLbs * 1.15` to a fixed `260000`
- Change `farmTankLevel` calculation to account for all rounds: subtract milk loaded in previous rounds plus the current round's fill
- Formula: `260000 - (sum of previous rounds' fillLbs) - session.currentFill`

### 3. Max Overfill = 4 lbs

**File: `src/game/constantsV2.ts`**
- Change `maxOverfillLbs` default from `12_000` to `4`
- This flows through to `maxAllowedFill` (50,004 lbs) automatically via `settingsToConfig`

---

## Technical Details

The farm tank drain across rounds requires access to `session.rounds` (completed rounds data) in `GameScreenV2`. This is already available on the `session` prop, so no new props are needed.

The overfill change of 4 lbs means the load meter and tanker visuals will have a very tight window between target and max -- the target line and overfill cap will be nearly indistinguishable visually on the meter. The `LoadMeter` component uses `maxFill` (which will now be 50,004) as its display max, so the bar will essentially fill to ~100% at target with almost no visible overfill zone. This may need the meter's display range adjusted so the overfill zone is still visible, but that can be addressed as a follow-up if needed.

