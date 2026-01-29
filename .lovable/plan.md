
# Fill the Tank v2 — Piper Value Demo
## Complete Game Redesign Specification

---

## Overview

A single-attempt, 30-45 second trade show game that demonstrates the financial value of Piper by quantifying:
- **Time saved** (no agitation, no weighbridge delays)
- **Optimized tanker fill** (no empty capacity)  
- **Avoided milk loss** (no spills, no leftovers)

---

## Core Changes Summary

| Current Game | V2 Game |
|--------------|---------|
| Multiple levels/compartments | Single compartment, single attempt |
| Constant flow rate | Variable/unpredictable flow rate |
| No spill mechanic | Visible milk spill on overfill |
| No farm tank visual | Farm tank with visible milk drain |
| No pre-load decisions | Sampling + weighbridge questions |
| Money kept/lost focus | Cost breakdown (spill, haulage, time) |
| Per-load results | Annualized impact (×5 loads ×365 days) |

---

## New Game Flow

```text
┌─────────────────────────────────────────────────────────┐
│  IDLE SCREEN                                            │
│  "Tap to Load" + demo animation                         │
└─────────────────────────┬───────────────────────────────┘
                          │ tap
                          ▼
┌─────────────────────────────────────────────────────────┐
│  PRE-LOAD DECISIONS                                     │
│  Q1: "Sampling with Piper?" [YES/NO]                    │
│  Q2: "Need weighbridge?" [YES/NO]                       │
└─────────────────────────┬───────────────────────────────┘
                          │ answers submitted
                          ▼
┌─────────────────────────────────────────────────────────┐
│  FILLING PHASE (Single Attempt)                         │
│  - Farm tank drains as tanker fills                     │
│  - Variable flow rate (unpredictable)                   │
│  - Overfill triggers spill animation                    │
│  - Nudge button available (costs time)                  │
└─────────────────────────┬───────────────────────────────┘
                          │ player releases / presses DONE
                          ▼
┌─────────────────────────────────────────────────────────┐
│  RESULTS SCREEN                                         │
│  Per-load costs + Annualized impact                     │
│  "Piper removes this cost."                             │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Create

### 1. `src/game/constantsV2.ts` — New Configuration
Admin-configurable constants:

```typescript
export const GAME_CONFIG_V2 = {
  // Capacity
  TANKER_CAPACITY_L: 10_000,
  FARM_TANK_CAPACITY_L: 12_000, // Slightly more than tanker
  TARGET_FILL_PERCENT: 0.98, // Adjustable: 90%, 95%, 98%, 100%
  
  // Money values (€)
  MILK_VALUE_PER_L: 0.42,
  HAULAGE_COST_PER_LOAD: 180.00,
  TIME_COST_PER_MIN: 4.00,
  
  // Scaling
  FARM_LOADS_PER_DAY: 5,
  DAYS_PER_YEAR: 365,
  
  // Time penalties/savings (minutes)
  AGITATION_TIME_SAVED: 20, // Piper sampling
  WEIGHBRIDGE_TIME_COST: 10,
  
  // Flow mechanics
  FLOW_RATE_MIN_LPS: 80,
  FLOW_RATE_MAX_LPS: 140,
  FLOW_VARIANCE_INTERVAL_MS: 800, // Change every 0.8s
  
  // Nudge
  NUDGE_AMOUNT_L: 25,
  NUDGE_TIME_PENALTY_SEC: 2,
  
  // UI timing
  RESULTS_DISPLAY_TIME: 15000,
  ATTRACT_IDLE_TIME: 20000,
};
```

### 2. `src/game/components/PreLoadQuestions.tsx`
Simple yes/no decision screen:
- Question 1: "Sampling with Piper?" → YES saves 20 mins, NO costs 20 mins
- Question 2: "Need weighbridge?" → YES costs 10 mins, NO (Piper) saves 10 mins
- Big, touch-friendly buttons
- Submit button to proceed

### 3. `src/game/components/FarmTank.tsx`
Visual source tank that drains as player fills:
- Shows starting milk level (12,000L)
- Level drops in sync with tanker fill
- If player stops early, remaining milk is visually shown
- Label: "Milk left behind" with € value

### 4. `src/game/components/SpillAnimation.tsx`
Triggered when player overfills:
- Milk visually "spills" onto concrete below tanker
- Screen flash effect
- Big message: **"MILK ON THE GROUND — Call farm cat"** 🐈
- Tanker fill freezes at max
- Spill amount tracked

### 5. `src/game/components/ResultsScreenV2.tsx`
Complete cost breakdown with annualized impact:

**Per-Load Breakdown:**
- Milk spilled: X L = €Y (red, if applicable)
- Empty capacity: X% = €Y haulage wasted
- Time cost/saved: ±X mins = €Y
- **Total load cost: €Z**

**Annualized Impact:**
- "This farm loads 5 tankers a day"
- Daily: €Z × 5 = €A
- Annual: €A × 365 = **€B**
- Big closing: **"Piper removes this cost."**

---

## Files to Modify

### 1. `src/game/hooks/useGameStateV2.ts`
Complete rewrite of game logic:

**New State:**
```typescript
interface GameSessionV2 {
  // Pre-load decisions
  usePiperSampling: boolean | null;
  useWeighbridge: boolean | null;
  
  // Fill state
  currentFill: number;
  farmTankLevel: number;
  currentFlowRate: number;
  
  // Outcomes
  spillAmount: number;
  spillTriggered: boolean;
  emptyCapacity: number;
  milkLeftBehind: number;
  
  // Time tracking
  elapsedTime: number;
  timeDelta: number; // +/- minutes from decisions
  nudgeCount: number;
  
  // Costs (calculated)
  spillCost: number;
  haulageWasteCost: number;
  timeCost: number;
  totalLoadCost: number;
  annualCost: number;
}
```

**Variable Flow Rate Logic:**
```typescript
// Every 0.8 seconds, change flow rate
useEffect(() => {
  const interval = setInterval(() => {
    const newRate = random(FLOW_RATE_MIN, FLOW_RATE_MAX);
    setCurrentFlowRate(newRate);
  }, FLOW_VARIANCE_INTERVAL_MS);
  return () => clearInterval(interval);
}, []);
```

**Spill Detection:**
```typescript
if (currentFill > TANKER_CAPACITY_L) {
  spillAmount = currentFill - TANKER_CAPACITY_L;
  currentFill = TANKER_CAPACITY_L; // Freeze at max
  spillTriggered = true;
}
```

### 2. `src/game/components/MilkTanker.tsx`
Simplify to single compartment + add spill visual:
- Remove multi-compartment logic
- Add milk dripping animation when overfilled
- Show puddle growing on "ground" below tanker

### 3. `src/game/components/GameScreen.tsx`
Add new layout with farm tank:
- Left side: Farm Tank (source, draining)
- Center: Connection pipe/hose
- Right side: Milk Tanker (destination, filling)
- Bottom: Controls + nudge button with time cost warning

### 4. `src/game/components/AttractMode.tsx`
Simplify and update messaging:
- Remove difficulty selector (single mode)
- Update tagline: "One shot. Real consequences."
- Show three Piper outcomes in attract animation

### 5. `src/game/FillTheTank.tsx`
Add pre-load questions state:
- New game state: "questions" between attract and playing
- Route through PreLoadQuestions before filling

---

## Cost Calculation Formulas

```typescript
// Derived values
const TARGET_FILL_L = TANKER_CAPACITY_L × TARGET_FILL_PERCENT;

// Spill cost (if overfilled)
const spillCost = spillAmount × MILK_VALUE_PER_L;

// Empty capacity cost (if underfilled)
const emptyCapacity_L = Math.max(0, TARGET_FILL_L - currentFill);
const emptyCapacity_Percent = emptyCapacity_L / TANKER_CAPACITY_L;
const haulageWasteCost = emptyCapacity_Percent × HAULAGE_COST_PER_LOAD;

// Time cost
const nudgeTimePenalty = nudgeCount × (NUDGE_TIME_PENALTY_SEC / 60);
const totalTimeMin = BASE_LOAD_TIME + timeDelta + nudgeTimePenalty;
const timeCost = Math.max(0, totalTimeMin) × TIME_COST_PER_MIN;

// Per-load total
const totalLoadCost = spillCost + haulageWasteCost + timeCost;

// Annualized
const dailyCost = totalLoadCost × FARM_LOADS_PER_DAY;
const annualCost = dailyCost × DAYS_PER_YEAR;
```

---

## Visual Feedback Summary

| Scenario | Visual | Message |
|----------|--------|---------|
| Overfill | Milk spills, screen flash | "MILK ON THE GROUND — Call farm cat" |
| Underfill | Empty space visible in tanker | "You paid to haul air." |
| Milk left | Visible in farm tank | "Milk left behind." |
| Perfect fill | Green glow, confetti | "Perfect load!" |
| Nudge used | Timer ticks up | "Time costs money." (tooltip) |

---

## Technical Notes

1. **Variable flow rate** makes the game genuinely challenging — no one wins by accident
2. **Single attempt** creates urgency and keeps queue moving
3. **Farm tank drain** provides intuitive visual feedback
4. **Annualized costs** make the impact real for decision-makers
5. **Humour** ("Call farm cat") makes it memorable

---

## Implementation Order

1. Create `constantsV2.ts` with all configurable values
2. Create `PreLoadQuestions.tsx` component
3. Create `FarmTank.tsx` visual component
4. Create `SpillAnimation.tsx` with milk puddle effect
5. Rewrite `useGameStateV2.ts` with new logic
6. Update `MilkTanker.tsx` for single compartment + spill
7. Update `GameScreen.tsx` with new layout
8. Create `ResultsScreenV2.tsx` with cost breakdown
9. Update `AttractMode.tsx` with new messaging
10. Update `FillTheTank.tsx` to orchestrate new flow
