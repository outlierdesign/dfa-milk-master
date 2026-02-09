

# Settings Panel Overhaul + 3-Round Game + Lbs Unit System

## Overview

This is a significant restructuring that touches nearly every game file. The changes fall into three categories:

1. **3-Round Game Structure** -- Each session now has 3 loading rounds with annualised scoring
2. **Switch to lbs as primary unit** -- All settings, display, and calculations use lbs
3. **Expanded Cost Model** -- New cost parameters (underfill cost, driver rate, overfill events/year)

---

## 1. Unit System Change (Litres to Lbs)

All internal values switch to lbs. The conversion factor (1 litre = 2.27 lbs) is used only for optional display.

| Current (Litres) | New (Lbs) |
|---|---|
| TANKER_CAPACITY_L: 22,026 | TARGET_LOAD_LBS: 50,000 |
| MILK_VALUE_PER_L: 0.42 | MILK_COST_PER_LB: 0.19 |
| FLOW_RATE_BASE_LPS: 1,762 | FLOW_RATE_LBS_PER_MIN: 2,000 |
| OVERFILL_TOLERANCE_L: 440 | MAX_OVERFILL_LBS: 12,000 |

---

## 2. New Admin Settings (Full List)

### Load and Production
- `targetLoadLbs` (default: 50,000) -- Target load weight
- `maxOverfillLbs` (default: 12,000) -- Max allowed overfill before auto-stop
- `loadsPerDay` (default: 5)
- `daysPerYear` (default: 365)
- `annualLoadsOverride` (optional) -- Manually set annual loads instead of auto-calculating

### Overfill Rules
- `overfillEventsPerYear` (default: 12) -- Used in annualisation weighting
- `fireOnThreeOverfills` (boolean, default: true) -- 3 overfills = game over

### Cost Assumptions
- `underfillCostPerLoad` (default: 500) -- Cost per extra load needed
- `milkCostPerLb` (default: 0.19)
- `driverRatePerHour` (default: 120)
- `agitationMinutes` (default: 20)
- `weighScaleMinutes` (default: 15)

### Flow Mechanics
- `flowRateLbsPerMin` (default: 2,000)
- `flowJitterPercent` (default: 3) -- Random flow rate variance
- `stopAutomaticallyAtMaxOverfill` (boolean, default: true)
- `gameSpeedMultiplier` (1x/2x/5x/10x)

### Piper Mode (unchanged conceptually)
- `piperSlowdownThreshold` (default: 90%)
- `piperSlowdownFactor` (default: 30%)

### Currency
- `currency` ("$" or "euro")

---

## 3. Three-Round Game Flow

```text
ATTRACT --> QUESTIONS --> ROUND 1 --> ROUND 2 --> ROUND 3 --> SCORING --> LEAD CAPTURE --> RESULTS
                            |           |           |
                            v           v           v
                        (fill once) (fill once) (fill once)
                            |           |           |
                        penalty     penalty     penalty
                        reveal      reveal      reveal
```

### New Game States
- `attract` -- Unchanged
- `questions` -- Pre-load Piper YES/NO choice (applies to all 3 rounds)
- `playing` -- Active filling round (tracks current round number 1-3)
- `roundResult` -- NEW: Brief per-round feedback before next round
- `penaltyReveal` -- Shows after all 3 rounds
- `leadCapture` -- Unchanged
- `results` -- Final combined results with annualised scoring

### Session State Changes

```typescript
interface GameSessionV2 {
  // Pre-load decisions (apply to all rounds)
  usePiperSampling: boolean;
  useWeighbridge: boolean;

  // Round tracking
  currentRound: number;        // 1, 2, or 3
  totalRounds: number;         // always 3
  rounds: RoundResult[];       // completed round data
  isFired: boolean;            // true if 3 overfills

  // Current round fill state
  currentFill: number;
  currentFlowRate: number;
  hasStartedFilling: boolean;
  fillLocked: boolean;
  spillTriggered: boolean;
  spillAmount: number;
  fillStartTime: number | null;
  fillEndTime: number | null;
  // ... etc
}

interface RoundResult {
  roundNumber: number;
  fillLbs: number;
  creditedLbs: number;     // min(fillLbs, targetLoad)
  spillLbs: number;         // max(0, fillLbs - targetLoad)
  isOverfill: boolean;
  fillDuration: number;
  averageFlowRate: number;
}
```

### "Fired" Logic
- After each round, check if overfill count across all rounds equals 3
- If `fireOnThreeOverfills` is enabled and all 3 rounds overfill: show "You're Fired" screen, no leaderboard submission
- If fewer than 3 overfills: proceed to scoring

---

## 4. Scoring Engine (Annualised Weighting)

The scoring exactly follows the spec's weighting system:

```typescript
function calculateScore(rounds: RoundResult[], config: GameSettings) {
  const N = config.annualLoadsOverride ?? (config.loadsPerDay * config.daysPerYear);
  const overfillRounds = rounds.filter(r => r.isOverfill);
  const underfillRounds = rounds.filter(r => !r.isOverfill);
  const k = overfillRounds.length; // number of overfill rounds

  // Assign annual weights based on overfill count
  let weights: Map<number, number>;
  
  if (k === 0) {
    // Each round weighted N/3
    weights = new Map(rounds.map(r => [r.roundNumber, N / 3]));
  } else if (k === 1) {
    // Overfill round weighted 12 (overfillEventsPerYear)
    // Remaining (N - 12) split evenly between 2 underfill rounds
    const underfillWeight = (N - config.overfillEventsPerYear) / 2;
    weights = new Map();
    rounds.forEach(r => {
      weights.set(r.roundNumber, r.isOverfill ? config.overfillEventsPerYear : underfillWeight);
    });
  } else if (k === 2) {
    // Each overfill weighted overfillEventsPerYear / 2
    // Remaining assigned to single underfill round
    const overfillWeight = config.overfillEventsPerYear / 2;
    const underfillWeight = N - config.overfillEventsPerYear;
    weights = new Map();
    rounds.forEach(r => {
      weights.set(r.roundNumber, r.isOverfill ? overfillWeight : underfillWeight);
    });
  }
  // k === 3 handled separately (fired)

  // Average credited capacity
  let weightedCredited = 0;
  rounds.forEach(r => {
    weightedCredited += (weights.get(r.roundNumber) ?? 0) * r.creditedLbs;
  });
  const avgCredited = weightedCredited / N;

  // Cost calculation
  const annualMilkBaseline = config.targetLoadLbs * N;
  const actualLoads = annualMilkBaseline / avgCredited;
  const extraLoads = actualLoads - N;
  const underfillCost = extraLoads * config.underfillCostPerLoad;

  // Spill cost (annualised)
  let totalSpillCost = 0;
  rounds.forEach(r => {
    totalSpillCost += r.spillLbs * (weights.get(r.roundNumber) ?? 0) * config.milkCostPerLb;
  });

  // Time cost (driver rate)
  const agitationCost = !usePiper
    ? (config.agitationMinutes / 60) * config.driverRatePerHour * N
    : 0;
  const weighbridgeCost = useWeighbridge
    ? (config.weighScaleMinutes / 60) * config.driverRatePerHour * N
    : 0;

  return {
    avgCredited,
    underfillCost,
    spillCost: totalSpillCost,
    agitationCost,
    weighbridgeCost,
    totalScore: underfillCost + totalSpillCost, // leaderboard score
  };
}
```

---

## 5. Updated Admin Panel UI

The panel keeps the same Ctrl+Shift+A access and modal design but reorganises into new groups:

### Groups:
1. **Game Speed** -- Speed multiplier buttons (unchanged)
2. **Load and Production** -- targetLoadLbs, maxOverfillLbs, loadsPerDay, daysPerYear, annualLoadsOverride
3. **Overfill Rules** -- overfillEventsPerYear, fireOnThreeOverfills (toggle switch)
4. **Cost Assumptions** -- underfillCostPerLoad, milkCostPerLb, driverRatePerHour, currency selector
5. **Time Penalties** -- agitationMinutes, weighScaleMinutes
6. **Flow Mechanics** -- flowRateLbsPerMin, flowJitterPercent, stopAutomaticallyAtMaxOverfill (toggle)
7. **Piper Mode** -- Slowdown threshold and factor (unchanged)

### UI Additions:
- Warning text at bottom: "Changing these values affects future games only."
- "Reset to Piper Defaults" button (replaces current "Reset to Defaults")
- Toggle switches for boolean settings (fireOnThreeOverfills, stopAutomaticallyAtMaxOverfill)
- Inline validation preventing negative numbers

---

## 6. New UI Components Needed

### RoundResultScreen (new)
- Brief feedback shown between rounds (2-3 seconds)
- Shows: "Round X Complete", fill amount, over/under status
- "Next Round" auto-transition or tap to continue

### FiredScreen (new)
- Shown when all 3 rounds are overfills
- Dramatic "You're Fired!" message
- "Try Again" button (no leaderboard submission)

### Updated ResultsScreenV2
- Shows per-round breakdown table (Round 1/2/3 with credited, spilled, weight)
- Shows annualised scoring breakdown
- Final score displayed as currency (lower = better)
- "Your Score: $X,XXX" prominently displayed

---

## 7. Leaderboard Updates

- Leaderboard sorted by **lowest total variable cost** (lower = better)
- Each entry stores a `settingsHash` (hash of the active settings at time of play)
- Existing entries remain valid when settings change
- "Fired" players cannot submit scores

---

## 8. Files to Modify

| File | Changes |
|---|---|
| `src/game/constantsV2.ts` | Complete rewrite: all values in lbs, new cost params, new game states |
| `src/game/hooks/useGameStateV2.ts` | 3-round logic, round tracking, fired detection, lbs units |
| `src/game/components/AdminPanel.tsx` | New settings fields, toggle switches, reorganised groups, validation |
| `src/game/components/GameScreenV2.tsx` | Round indicator, lbs display, auto-stop at max overfill |
| `src/game/components/ResultsScreenV2.tsx` | Per-round table, annualised scoring, new cost breakdown |
| `src/game/components/LoadReceipt.tsx` | Lbs units, new cost line items |
| `src/game/components/PenaltyRevealScreen.tsx` | Lbs units, updated penalty list |
| `src/game/components/SpillAnimation.tsx` | Lbs display |
| `src/game/components/TankerV2.tsx` | Fill calculations use lbs |
| `src/game/components/LoadMeter.tsx` | Lbs units |
| `src/game/components/FarmTank.tsx` | Lbs units |
| `src/game/components/AttractModeV2.tsx` | Updated leaderboard display (score = cost) |
| `src/game/components/PreLoadQuestions.tsx` | Minor text updates |
| `src/game/components/GameTimer.tsx` | Minor unit updates |
| `src/game/FillTheTank.tsx` | Route 3-round flow, new states |
| `src/game/hooks/useLeaderboard.ts` | Sort by lowest cost, store settingsHash |
| `src/game/types.ts` | Update LeaderboardEntry type |

### New Files
| File | Purpose |
|---|---|
| `src/game/components/RoundResultScreen.tsx` | Between-round feedback |
| `src/game/components/FiredScreen.tsx` | "You're Fired" game over |
| `src/game/utils/scoringEngine.ts` | Standalone scoring calculation (no hardcoded constants) |

---

## 9. Implementation Order

Given the scope, this will be implemented in stages:

**Stage 1**: Constants + Settings Panel (new defaults in lbs, expanded admin panel)
**Stage 2**: Game state refactor (3-round loop, round tracking, fired logic)
**Stage 3**: Scoring engine (annualisation weighting, new cost model)
**Stage 4**: UI updates (round indicator, per-round results, fired screen, lbs display throughout)
**Stage 5**: Leaderboard updates (sort by lowest cost, settings hash)

