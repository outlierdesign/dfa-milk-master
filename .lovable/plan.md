
# Calibrate Load Time: 15-Second Gameplay = 12-Minute Displayed Timer, With Matching Cost Basis

## The Problem

Two things need fixing together:

1. **Speed and display are miscalibrated**: The current `gameSpeedMultiplier` is `1`, meaning the timer shows real wall-clock seconds (e.g. a 25-second fill shows as "00:25"). The target is ~15 real seconds of button-holding displaying as approximately "12:00" — representing a real tanker load in the field.

2. **Cost time basis must match the displayed time**: Agitation (+20:00) and weighbridge (+15:00) penalty minutes are already shown on the timer and are already the source for cost calculations — this is correct behaviour. Once the speed multiplier is set, the displayed time will represent true real-world minutes, making the cost basis genuinely reflect "12 minutes of driver time per load".

## How the System Works

The game has two coupled values in `constantsV2.ts`:

- `flowRateLbsPerMin` — how many lbs of milk fill per simulated minute
- `gameSpeedMultiplier` — compresses real time into simulated time for display

The fill loop calculates:
```
fillDelta = flowRate (lbs/min) × deltaTime (real seconds) × speedMultiplier
```

The timer shows:
```
displayedTime = wallClockSeconds × speedMultiplier
```

## The Maths

**Target:** 15 real seconds fills 50,000 lbs and displays as 12:00

**Step 1 — Speed multiplier** (converts real seconds to displayed seconds):
```
12 minutes × 60 seconds ÷ 15 real seconds = 48
```
So `gameSpeedMultiplier = 48`

**Step 2 — Flow rate** (must fill 50,000 lbs in 12 simulated minutes):
```
flowRateLbsPerMin = 50,000 lbs ÷ 12 minutes = 4,167 lbs/min
```

Verification: `4,167 lbs/min × 15 real seconds × (48/60) = 50,004 lbs` ✓

## Cost Basis — Already Correct, Now Meaningful

The scoring engine calculates agitation and weighbridge costs like this:
```ts
agitationCost = (agitationMinutes / 60) × driverRatePerHour × annualLoads
weighbridgeCost = (weighScaleMinutes / 60) × driverRatePerHour × annualLoads
```

These `agitationMinutes` (20) and `weighScaleMinutes` (15) are the **same values** shown on the game timer as pending penalties. Once the speed multiplier is set to 48, the displayed fill timer will show ~12:00 for a full load — making the whole time display consistent and grounded in real-world minutes. A driver's load really does take ~12 minutes; agitation really does add 20 minutes; the weighbridge really does add 15 minutes. The costs will now clearly correspond to what players see on screen.

## Piper Slowdown Behaviour

With Piper enabled, the flow slows to 30% at 90% fill (45,000 lbs):
- Phase 1 (0 → 45,000 lbs): ~13.5 real seconds, shows ~10:48
- Phase 2 (45,000 → 50,000 lbs): ~2.4 real seconds, shows ~01:55
- **Total with Piper: ~15.9 seconds, displayed as ~12:43** — adds realistic tension as the meter creeps toward target

## Files to Change

### `src/game/constantsV2.ts` — 2 value changes only

```ts
// BEFORE
flowRateLbsPerMin: 2_000,
gameSpeedMultiplier: 1,

// AFTER
flowRateLbsPerMin: 4_167,
gameSpeedMultiplier: 48,
```

No logic changes needed. The fill loop, timer display, `fillDuration` recording, and cost calculations all already use these values correctly.

## Impact Summary

| Area | Before | After |
|---|---|---|
| Real fill time | ~25 seconds | ~15 seconds |
| Displayed timer (full load) | ~00:25 | ~12:00 |
| Agitation cost basis | 20 minutes (abstract) | 20 minutes (shown on timer) |
| Weighbridge cost basis | 15 minutes (abstract) | 15 minutes (shown on timer) |
| Flow rate display on HUD | 2,000 lbs/min | ~4,167 lbs/min |
| Spill / overfill logic | Unchanged | Unchanged |
| Admin speed multiplier slider | Still adjustable | Still adjustable from base of 48 |
