

# Add Live Timer to Game Screen

## Overview

Add a prominent countdown/countup timer to the game screen that visually demonstrates time jeopardy. The timer will:
1. **Count up during filling** - Shows real-time elapsed loading time
2. **Display time penalties** - If player selected NO to Piper sampling (agitation required) or YES to weighbridge, show penalty time being added
3. **Create urgency** - Large, animated timer makes players feel the time pressure that costs money

---

## How It Works

### Timer Behavior

| Pre-Load Decision | Timer Effect |
|-------------------|--------------|
| Piper Sampling: NO | +20 min penalty added at end |
| Weighbridge: YES | +10 min penalty added at end |
| Nudges used | +2 sec each added to timer |

### Visual Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                      DURING FILLING                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │         ⏱️  LOAD TIME: 00:12.4                              ││
│  │                                                              ││
│  │   [If penalties pending, show warning below timer]           ││
│  │   ⚠️ +20 min agitation | +10 min weighbridge                ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ON COMPLETE (dramatic reveal)               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │         LOAD TIME: 00:12.4                                   ││
│  │                                                              ││
│  │   [Penalties animate in and add to total]                    ││
│  │         + 20:00 agitation ⏱️                                 ││
│  │         + 10:00 weighbridge ⏱️                               ││
│  │         ─────────────────────                                ││
│  │         TOTAL: 30:12.4  💸                                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. New Component: `src/game/components/GameTimer.tsx`

A dedicated timer component that displays:
- **Live elapsed time** during filling (counting up in seconds)
- **Penalty warnings** if player made costly decisions (shown as pending)
- **Visual urgency** with color changes and pulse animations

Key features:
- Uses `useEffect` interval to update display every 100ms for smooth counting
- Shows decimal seconds for precision feel (e.g., "12.4s")
- Displays pending penalties below the timer with warning styling
- Pulsing animation when penalties are pending

### 2. Update `src/game/hooks/useGameStateV2.ts`

Add new session field to track live elapsed time:
- `liveElapsedTime: number` - Updates in real-time during filling phase
- Modify the filling loop to also update this value
- This separates "display time" from "final calculated duration"

### 3. Update `src/game/components/GameScreenV2.tsx`

Replace the current simple "TIME SAVED/LOST" indicator in the header with the new prominent timer:
- Add `GameTimer` component to the center of the header area
- Keep flow rate indicator on the left
- Show the timer prominently in the center
- Remove or move the current timeDelta display

---

## Visual Design

### Timer States

| State | Color | Animation |
|-------|-------|-----------|
| Filling actively | Sky blue | Subtle pulse |
| Penalties pending | Amber | Warning pulse |
| Spill triggered | Red | Frozen, no animation |
| Good choices made | Emerald | Calm glow |

### Penalty Warning Display

When player has time penalties pending:
```text
┌────────────────────────────────┐
│     ⏱️ LOAD TIME              │
│        00:15.2                │
│  ────────────────────────────  │
│  ⚠️ PENDING PENALTIES:         │
│  • +20 min (no Piper sampling) │
│  • +10 min (weighbridge)       │
└────────────────────────────────┘
```

---

## Technical Approach

### GameTimer Component Structure

```typescript
interface GameTimerProps {
  fillStartTime: number | null;
  isFilling: boolean;
  usePiperSampling: boolean;
  useWeighbridge: boolean;
  nudgeCount: number;
  spillTriggered: boolean;
  config: GameConfig;
}
```

### Timer Logic

1. **During filling**: Show elapsed time counting up from `fillStartTime`
2. **Penalties display**: Always visible if player made costly choices
3. **On complete**: Timer freezes, penalties are highlighted

### State Changes to `useGameStateV2.ts`

No major changes needed - we already have:
- `fillStartTime` - When filling started
- `usePiperSampling` / `useWeighbridge` - Decision flags
- `nudgeCount` - Number of nudges used
- `AGITATION_TIME_SAVED` / `WEIGHBRIDGE_TIME_COST` - Config values

The timer component will calculate display values from these existing fields.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/game/components/GameTimer.tsx` | New timer display component with penalties |

## Files to Modify

| File | Changes |
|------|---------|
| `src/game/components/GameScreenV2.tsx` | Replace header time display with GameTimer component |

---

## User Experience Flow

1. **Pre-load questions**: Player selects NO to Piper sampling and YES to weighbridge
2. **Game starts**: Timer appears showing "LOAD TIME: 00:00.0" with warning "⚠️ +30 min penalties pending"
3. **During filling**: Timer counts up, penalties remain visible as a reminder
4. **Each nudge**: Small "+2s" animation flashes by the timer
5. **On complete**: Timer freezes, player sees their actual fill time plus the penalty minutes
6. **Results screen**: Full breakdown of time costs with € values

This creates a visceral "time is money" experience that demonstrates Piper's value proposition.

