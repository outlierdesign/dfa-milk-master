
# Game UI Improvements: Stats Prominence + Speed Control

## Overview

Two main improvements to enhance the trade show demo experience:

1. **Reorganize stats display** - Move Target, Current, and Remaining values above the tank graphics, directly below the timer, making them the focal point
2. **Add game speed multiplier** - Speed up the filling animation while showing the "real-world equivalent" time the load would actually take

---

## 1. Stats Display Reorganization

### Current Layout
```text
┌──────────────────────────────────────────────────────────────────┐
│  FLOW RATE     │      PIPER LOGO + TIMER        │  FILL THE TANK │
│   178 L/s      │      00:19.4 + Penalties       │                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│     [FARM TANK]  ═══════  [MILK TANKER]                          │
│      REMAINING            TARGET    CURRENT                       │
│       9,058L             10,000L    2,942L                        │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                     [CONTROLS]                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Proposed Layout
```text
┌──────────────────────────────────────────────────────────────────┐
│  FLOW RATE     │      PIPER LOGO + TIMER        │  FILL THE TANK │
│   178 L/s      │      00:19.4 + Penalties       │                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│     REMAINING           TARGET           CURRENT                  │
│      9,058L            10,000L           2,942L                   │
│                                                                   │
│     [FARM TANK]  ═══════  [MILK TANKER]                          │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                     [CONTROLS]                                    │
└──────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Create a new prominent stats bar between header and graphics
- Large, bold numbers for TARGET, CURRENT, REMAINING
- Color-coded boxes: emerald for target, white/red for current (changes on spill), sky-blue for remaining
- Remove redundant displays from TankerV2 and FarmTank components

---

## 2. Game Speed Multiplier

### Concept
Instead of a 60+ second real-time fill at 80-140 L/s, introduce a speed multiplier (e.g., 5x, 10x) that:
- Speeds up the visual fill animation and game clock
- Displays the "simulated real-world time" that the load would actually represent

### UI Addition
A toggle/selector in the admin panel:

| Setting | Effect |
|---------|--------|
| 1x (Real-time) | ~60-90 seconds to fill 10,000L |
| 5x | ~12-18 seconds to fill (shows "represents 60-90s") |
| 10x | ~6-9 seconds to fill (shows "represents 60-90s") |

### How It Works
- The fill interval applies the multiplier to how much liquid is added per tick
- The displayed "load time" shows the **simulated** time (as if real-world)
- The actual game clock runs faster, but financial calculations use the simulated time

### Timer Display Update
```text
┌────────────────────────────┐
│     ⏱️ LOAD TIME           │
│     00:45.2                │   <- Simulated real-world time
│     (5x speed)             │   <- Small indicator
│                            │
│  ⚠️ PENDING PENALTIES:     │
│  Weighbridge stop +10:00   │
└────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/game/components/GameScreenV2.tsx` | Add prominent stats bar between header and graphics |
| `src/game/components/TankerV2.tsx` | Remove the bottom "TARGET/CURRENT" display (moved up) |
| `src/game/components/FarmTank.tsx` | Remove the "REMAINING" display (moved up) |
| `src/game/components/AdminPanel.tsx` | Add "Game Speed" multiplier setting (1x, 2x, 5x, 10x) |
| `src/game/hooks/useGameStateV2.ts` | Apply speed multiplier to fill rate, track simulated time separately |
| `src/game/constantsV2.ts` | Add GAME_SPEED_MULTIPLIER default constant |
| `src/game/components/GameTimer.tsx` | Display simulated time with speed indicator |

---

## Technical Details

### New Admin Setting

```typescript
// In AdminSettings interface
gameSpeedMultiplier: number; // 1, 2, 5, or 10

// Default
gameSpeedMultiplier: 1
```

### Speed Multiplier Logic

In `useGameStateV2.ts`, the fill loop currently does:
```typescript
const fillDelta = prev.currentFlowRate * deltaTime;
```

With speed multiplier:
```typescript
const fillDelta = prev.currentFlowRate * deltaTime * config.GAME_SPEED_MULTIPLIER;
```

The timer tracks "simulated time":
```typescript
// Actual wall-clock time passed
const actualTime = (now - startTime) / 1000;

// Simulated real-world time (what would have passed at 1x)
const simulatedTime = actualTime * config.GAME_SPEED_MULTIPLIER;
```

### Session State Addition

```typescript
// In GameSessionV2
simulatedFillDuration: number; // The "real-world equivalent" time
```

### GameConfig Addition

```typescript
// In GameConfig interface
GAME_SPEED_MULTIPLIER: number;
```

---

## Summary

1. **Stats bar**: A horizontal row of TARGET, CURRENT, and REMAINING displayed prominently between the timer and the tank graphics
2. **Speed multiplier**: Admin-configurable option (1x/2x/5x/10x) that speeds up gameplay while preserving the simulation of real-world time costs

This makes the key numbers impossible to miss during demos while keeping game sessions short enough for trade show engagement (~10-20 seconds at 5x speed).
