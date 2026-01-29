

# Enhanced Milk Tanker Visual & Results Screen Lead Capture

## Overview

Two major enhancements to the Fill the Tank v2 game:
1. **Realistic Milk Tanker Design** - Redesign the tanker to match the reference image with proper semi-truck cab and cylindrical trailer
2. **Lead Capture & Receipt Format** - Add contact form and detailed load metrics to the results screen

---

## Part 1: Realistic Milk Tanker Visual

### Current State
The existing `TankerV2.tsx` renders a simplified truck with:
- Small grey cab attached to the tank
- Rounded cylindrical tank body
- Basic wheel representation

### Target Design (from reference image)
A proper articulated milk tanker with:
- **Dark blue semi-truck cab** - Sleeper-style with distinct hood, windshield, and exhaust stacks
- **Separate cylindrical stainless steel trailer** - Mounted on a black frame with "MILK" text
- **Dual rear axle wheels** - Both on cab and trailer
- **Proper proportions** - Cab is about 1/4 of total length, trailer is 3/4

### Implementation Changes to `TankerV2.tsx`

**New Visual Structure:**
```text
┌───────────┐   ┌─────────────────────────────────────────────┐
│   CAB     │───│              TANK TRAILER                   │
│ (blue)    │   │  ┌─────────────────────────────────────┐   │
│ ┌─────┐   │   │  │    [MILK liquid fill animation]     │   │
│ │wind │   │   │  │         "MILK" text on side         │   │
│ │-ow  │   │   │  └─────────────────────────────────────┘   │
│ └─────┘   │   │         [undercarriage frame]              │
│ [exhaust] │   │                                             │
│    O   O  │   │        O O              O O                 │
└───────────┘   └─────────────────────────────────────────────┘
   wheels              front axle        rear axle
```

**Key Visual Elements:**
- Semi-truck cab with navy blue body, silver grill, blue-tinted windshield
- Exhaust stacks on cab
- Fifth wheel connector between cab and trailer
- Silver/stainless steel cylindrical tank with metallic sheen
- "MILK" text prominently displayed
- Black frame/undercarriage
- Orange/red wheel rims with black tires
- Target line and fill level inside tank cutaway view

---

## Part 2: Results Screen Lead Capture & Receipt Format

### New Features

#### A. Lead Capture Form
Add optional contact capture before "Play Again":
- Name (text input)
- Phone OR Email (toggle between options)
- Optional checkbox: "Send me info about Piper"
- Submit saves to localStorage (or future Supabase integration)

#### B. Enhanced "THIS LOAD" Receipt
Add load statistics in a receipt-style format:

| Metric | Value | Source |
|--------|-------|--------|
| Load Time | Xs | Track elapsed time during filling phase |
| Avg Flow Rate | XXX L/s | Average of flow rate samples |
| Volume Loaded | X,XXX L | session.currentFill |
| Target Volume | X,XXX L | config.TARGET_FILL_L |
| Accuracy | XX.X% | Calculated |

### State Changes Required

**`useGameStateV2.ts`** - Track new metrics:
```typescript
interface GameSessionV2 {
  // ... existing fields
  
  // New timing metrics
  fillStartTime: number | null;
  fillEndTime: number | null;
  totalFillDuration: number; // seconds
  flowRateSamples: number[]; // for calculating average
}
```

**`ResultsScreenV2.tsx`** - New sections:
1. Receipt-style load data section with all metrics
2. Lead capture form component
3. Updated layout to accommodate new elements

### Lead Data Structure
```typescript
interface LeadCapture {
  id: string;
  name: string;
  contactType: 'phone' | 'email';
  contactValue: string;
  wantsInfo: boolean;
  gameResults: {
    accuracy: number;
    loadTime: number;
    volumeLoaded: number;
    totalCost: number;
  };
  timestamp: string;
}
```

---

## Files to Modify

### 1. `src/game/components/TankerV2.tsx`
Complete redesign of the visual:
- Replace current cab with proper semi-truck design
- Add fifth wheel connector
- Redesign tank as separate trailer unit
- Add "MILK" text
- Improve wheel styling with dual axles
- Keep all existing fill mechanics (target line, fill animation, spill detection)

### 2. `src/game/hooks/useGameStateV2.ts`
Add timing and flow tracking:
- `fillStartTime` / `fillEndTime` timestamps
- `flowRateSamples` array to track flow rate over time
- `totalFillDuration` calculated on load complete
- Update `startFilling()`, `stopFilling()`, and `completeLoad()` to track these

### 3. `src/game/components/ResultsScreenV2.tsx`
Major enhancements:
- Add "LOAD RECEIPT" section with load time, avg flow, volume metrics
- Add lead capture form (name, phone/email, checkbox)
- Store leads in localStorage
- Update layout to accommodate new sections
- Add form validation

---

## Technical Details

### Timing Calculation
```typescript
// In startFilling:
fillStartTime = performance.now();

// In stopFilling (or during filling):
// Accumulate total fill duration

// In completeLoad:
totalFillDuration = accumulatedFillTime; // seconds
avgFlowRate = flowRateSamples.reduce((a,b) => a+b, 0) / flowRateSamples.length;
```

### Lead Storage
```typescript
// Save to localStorage
const leads = JSON.parse(localStorage.getItem('piper_leads') || '[]');
leads.push(newLead);
localStorage.setItem('piper_leads', JSON.stringify(leads));
```

---

## Visual Mockup: Results Screen Layout

```text
┌─────────────────────────────────────────────────┐
│           🎉 Perfect Load! / 💔 Milk Lost       │
│              Accuracy: 98.5%                    │
├─────────────────────────────────────────────────┤
│                 LOAD RECEIPT                    │
│  ─────────────────────────────────────────────  │
│  Load Time:        12.4s                        │
│  Avg Flow Rate:    108 L/s                      │
│  Volume Loaded:    9,800 L                      │
│  Target Volume:    9,800 L                      │
│  ─────────────────────────────────────────────  │
│  Spill:            0 L              €0.00       │
│  Empty Capacity:   2%               -€3.60      │
│  Time Saved:       +30 mins         +€120.00    │
│  ─────────────────────────────────────────────  │
│  LOAD COST:                         €3.60       │
├─────────────────────────────────────────────────┤
│              ANNUALIZED IMPACT                  │
│                 €6,570/year                     │
├─────────────────────────────────────────────────┤
│           Piper removes this cost.              │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │  Want to learn more about Piper?          │  │
│  │  Name: [_____________________]            │  │
│  │  ( ) Phone  ( ) Email                     │  │
│  │  [_____________________]                  │  │
│  │  [ ] Send me info about Piper             │  │
│  │         [SUBMIT & PLAY AGAIN]             │  │
│  └───────────────────────────────────────────┘  │
│                 [SKIP - PLAY AGAIN]             │
└─────────────────────────────────────────────────┘
```

---

## Implementation Order

1. **Update `useGameStateV2.ts`** - Add timing/flow tracking fields and logic
2. **Redesign `TankerV2.tsx`** - Complete visual overhaul to match reference
3. **Enhance `ResultsScreenV2.tsx`** - Add receipt format and lead capture form
4. **Update `GameScreenV2.tsx`** - Pass new session data as needed

