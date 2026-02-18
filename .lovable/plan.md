
# Fix k=2 Scenario Weighting in the Scoring Engine

## What's Wrong Today

The scoring engine has a bug in the 2-overfill (k=2) case. Currently it splits the `overfillEventsPerYear` value across both overfill rounds, giving each only 6 loads (12 ÷ 2). This also leaves the single underfill round with 1812 loads (1824 − 12) instead of 1800.

The correct logic — per your spec — is that **each** overfill scenario represents the same 12 annual overfill events independently, so each overfill round should carry 12 loads and the underfill round gets the remainder.

## Correct Weighting (N = 1824, overfillEventsPerYear = 12)

| Scenario | Round 1 | Round 2 | Round 3 | Total |
|---|---|---|---|---|
| k=0 (3 underfills) | 608 | 608 | 608 | 1824 ✅ |
| k=1 (1 overfill, 2 underfills) | 12 (if overfill) | 906 | 906 | 1824 ✅ |
| k=2 (2 overfills, 1 underfill) — **CURRENT** | 6 | 6 | 1812 | 1824 ❌ |
| k=2 (2 overfills, 1 underfill) — **FIXED** | 12 | 12 | 1800 | 1824 ✅ |

Note: the total is now 1824 (12 + 12 + 1800 = 1824) which is consistent, because we treat 12 overfill events as the annual frequency for each overfill round type.

## The Fix

**File: `src/game/utils/scoringEngine.ts`** — change 2 lines in the k=2 branch:

```
// BEFORE (wrong):
const overfillWeight = config.overfillEventsPerYear / 2;
const underfillWeight = N - config.overfillEventsPerYear;

// AFTER (correct):
const overfillWeight = config.overfillEventsPerYear;
const underfillWeight = N - (2 * config.overfillEventsPerYear);
```

That's it — a 2-line change in one file. Everything else (the results screen weight display, the spill cost calculation, the underfill cost calculation) reads from these weights automatically and will reflect the corrected values with no further changes needed.

## Default Settings to Confirm

To make sure the defaults reflect the spec precisely, the admin settings should be:

- `annualLoadsOverride: 1824` (or `loadsPerDay: 5, daysPerYear: 365` gives 1825 — **we should set an override of 1824**)
- `overfillEventsPerYear: 12`

Currently `loadsPerDay: 5 × daysPerYear: 365 = 1825`, not 1824. To get exactly 1824, we'll set `annualLoadsOverride: 1824` as the default in `constantsV2.ts`. This ensures the weighting rows always add up exactly to 1824.

## Files to Change

1. `src/game/utils/scoringEngine.ts` — fix the k=2 weight calculation (2 lines)
2. `src/game/constantsV2.ts` — set `annualLoadsOverride: 1824` as the default so N is always exactly 1824 (not 1825)
