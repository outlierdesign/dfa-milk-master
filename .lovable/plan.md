
## Adding Agitation & Weighbridge Steps to Each Round

### What We're Building

Each round will now have three distinct phases, played out in sequence:

```text
[TAP TO PLAY]
      |
      v
1. AGITATION PHASE
   - Timer starts immediately (simulated minutes counting up)
   - Spinning wheel animation + "Agitation in Progress" popup
   - Lasts: agitationMinutes × real seconds (scaled by speedMultiplier)
   - e.g. 20 sim-min at 48× = 25 real seconds
      |
      v
2. LOADING PHASE  (existing gameplay)
   - "TAP TO FILL / TAP TO STOP" button becomes active
   - Timer continues counting from where agitation left off
   - Spill mechanics, flow rate jitter — all unchanged
      |
      v
3. WEIGHBRIDGE PHASE  (new, after load is locked)
   - Truck drives off to the right of the screen
   - "Gone to Weighbridge" message appears
   - 2–3 second real delay
   - Round result is then shown (existing RoundResultScreen)
```

### Adjustability

The agitation duration is already configurable in the Admin Panel under **Time Penalties → Agitation Minutes**. The weighbridge delay will use a fixed 2.5-second real-world animation pause (no new setting needed — the simulated weighbridge *penalty time* already exists in settings).

---

### Technical Design

#### 1. New round sub-phases in `useGameStateV2.ts`

Add a `roundPhase` field to `GameSessionV2`:
```ts
roundPhase: "agitation" | "loading" | "weighbridge" | "complete"
```

- On `startGame()`: set `roundPhase: "agitation"`, begin the agitation timer.
- Agitation completes automatically after `(agitationMinutes / speedMultiplier) × 60` real seconds → sets `roundPhase: "loading"`.
- When player calls `completeLoad()`: set `roundPhase: "weighbridge"` → auto-advances to `"complete"` after 2.5 seconds → triggers `roundResult` game state.

The **overall timer** (`fillStartTime`) begins at the moment "TAP TO PLAY" is pressed (i.e., agitation start), so it accumulates agitation + fill time together, reflecting the real-world total time cost.

#### 2. New `AgitationOverlay` component

A new file: `src/game/components/AgitationOverlay.tsx`

Displays:
- A spinning gear/wheel SVG (CSS `animate-spin`)
- "Agitation in Progress" heading
- A countdown progress bar showing how much agitation time remains (in simulated minutes)
- Blocks the fill button while active

#### 3. New `WeighbridgeDepartureOverlay` component

A new file: `src/game/components/WeighbridgeDepartureOverlay.tsx`

Displays:
- The existing truck/tanker visual sliding from centre to the right and off-screen using a CSS `translate-x` keyframe animation (~1.5s)
- "Gone to Weighbridge" banner appears as the truck exits
- Auto-dismisses after 2.5 real seconds, then calls `completeLoad()` to go to round result

#### 4. Changes to `GameScreenV2.tsx`

- Conditionally render `AgitationOverlay` when `session.roundPhase === "agitation"`
- Render `WeighbridgeDepartureOverlay` when `session.roundPhase === "weighbridge"`
- Disable the fill button during agitation phase
- Pass `roundPhase` down from parent (already in session object)

#### 5. Changes to `useGameStateV2.ts`

- Add `roundPhase` to `GameSessionV2` interface and `createInitialSession()`
- Add agitation timer logic in `startGame()` using `setTimeout` scaled by speed
- Update `startFilling()` to only work when `roundPhase === "loading"`
- Update `completeLoad()` to set `roundPhase: "weighbridge"` instead of immediately going to `roundResult`
- Add `advanceFromWeighbridge()` callback (called by the overlay after animation)
- Update `resetRoundState()` to reset `roundPhase: "agitation"` and restart the agitation timer for the new round
- The `fillStartTime` is set when agitation begins (not when filling begins) so the timer reflects the full round time

#### 6. Changes to `GameTimer.tsx`

- The timer label changes dynamically:
  - During agitation: "AGITATION" (amber)
  - During loading: "LOAD TIME" (sky blue)
  - After fill locked: "TOTAL TIME" (slate)
- The timer starts from `agitationStartTime` (set at round start), not `fillStartTime`

#### 7. Changes to `AdminPanel.tsx`

- Bump `STORAGE_KEY` to `v8` and add `v7` to `OLD_KEYS` (to clear any cached values that don't include the new `roundPhase` field)
- No new settings needed — `agitationMinutes` and `weighScaleMinutes` already exist and are adjustable

---

### Files to Create

| File | Purpose |
|---|---|
| `src/game/components/AgitationOverlay.tsx` | Spinning wheel + countdown during agitation phase |
| `src/game/components/WeighbridgeDepartureOverlay.tsx` | Truck drive-off animation + "Gone to Weighbridge" message |

### Files to Modify

| File | Change |
|---|---|
| `src/game/hooks/useGameStateV2.ts` | Add `roundPhase`, agitation timer, weighbridge transition |
| `src/game/components/GameScreenV2.tsx` | Render overlays conditionally by `roundPhase` |
| `src/game/components/GameTimer.tsx` | Start timer from agitation start; label changes per phase |
| `src/game/components/AdminPanel.tsx` | Bump storage key to v8 |

---

### Timing Maths (48× speed, defaults)

| Phase | Simulated time | Real time |
|---|---|---|
| Agitation | 20 minutes | ~25 seconds |
| Loading | ~12 minutes | ~15 seconds |
| Weighbridge anim | — | 2.5 seconds |
| **Round total** | **~32 minutes** | **~42 seconds** |

This gives each 3-round game a real-world duration of approximately 2 minutes — appropriate for a trade show booth experience.
