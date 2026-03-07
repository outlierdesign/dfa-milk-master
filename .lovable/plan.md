

## Plan: "Switch On to Piper" Savings Reveal Screen

### Overview
Add a new interactive screen between `leadCapture` and `results` in the game flow. The player sees four $10,000 cash stacks representing hidden costs, flips industrial toggle switches to recover each stack into a tanker trailer, then auto-transitions to results after a 3-second celebration.

### Game Flow Change

Current: `penaltyReveal → leadCapture → results`
New: `penaltyReveal → leadCapture → **savingsReveal** → results`

### New Files

**`src/game/components/SavingsRevealScreen.tsx`**
- Full-screen component with retro 16-bit pixel aesthetic
- Four columns, each containing:
  - Pixel-art cash stack (SVG/CSS, ~$10K label)
  - Category label + description (Agitation Time, Weighbridge Trips, Fuel & Wear, Labour Hours)
  - Chunky industrial toggle switch (metal/farm style, CSS-rendered)
- Right-aligned tanker trailer (reuse `milk_tanker_full_v2.svg`)
- Counter display at bottom: ticks down `$40,000 → $30,000 → ... → $0`
- Caption after each switch: "That's money back in your pocket with Piper."
- Final state: full tanker, "You've just saved $40,000 a year with Piper." message
- 3-second auto-transition calls `onComplete`

Interactive behavior:
- Each switch is independently clickable (touch/mouse)
- On flip: cash stack animates (collapse + bills fly toward tanker via CSS keyframes), counter decrements, sound plays
- Switches can be activated in any order

Sound integration:
- Use existing `useSoundEffects` — `playSuccess` for cha-ching, `playButtonClick` for switch flip
- Add a short celebratory fanfare on all-four-complete (reuse `playSuccess`)

### State Management Changes

**`src/game/constantsV2.ts`**
- Add `"savingsReveal"` to the `GameStateV2` union type

**`src/game/hooks/useGameStateV2.ts`**
- Add `showSavingsReveal` callback that sets state to `"savingsReveal"`
- Modify `showResults` to remain as-is (called by the new screen's `onComplete`)
- Update `showLeadCapture` flow: leadCapture's submit/skip now calls `showSavingsReveal` instead of `showResults`

**`src/game/FillTheTank.tsx`**
- Import and render `SavingsRevealScreen` for `gameState === "savingsReveal"`
- Wire `leadCapture` onSubmit/onSkip to transition to `savingsReveal`
- Wire `savingsReveal` onComplete to `showResults`

### Visual Design Details

- Cash stacks: CSS pixel-art green rectangles stacked with slight offsets, dollar signs
- Industrial switches: tall rectangular toggle with metallic gradient, rounded cap, drop shadow; ON state slides cap up with green indicator
- Tanker: positioned bottom-right, SVG asset, glows/pulses as money enters
- Bill animation: individual small green rectangles fly along a CSS arc path toward tanker
- Counter: large retro font, red countdown with slot-machine tick effect
- Background: dark slate gradient consistent with existing screens

### Technical Approach
- Pure React + CSS animations (keyframes for bill flight paths, transitions for switch states)
- No external animation libraries needed
- Component manages its own local state (array of 4 booleans for switch states)
- ~300-400 lines for the new component

