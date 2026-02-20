

## Redesign the Attract / Opening Screen

### Overview
Replace the current attract screen with a cinematic "driving to the farm" scene featuring an infinite road animation, then a farm stats info box below it.

### Layout (top to bottom)
1. **Piper logo** (keep existing)
2. **"FILL THE TANK" title + subtitle** (keep, restyle slightly)
3. **Road animation viewport** -- a horizontal strip showing a perspective road with dashed white centre line scrolling toward the viewer, and the milk tanker SVG driving along it
4. **"This is your farm" info card** -- styled box listing the 5 farm stats, with a subtle scale-in/out pulse animation
5. **"TAP TO PLAY" button** (keep)
6. Sound toggle + admin shortcut (keep)
7. **Leaderboard removed entirely**

### Road Animation Details
- Pure CSS/SVG animation, no canvas or external libs
- Dark grey road surface with white dashed centre line using CSS `perspective` and `translateZ` to create the "driving forward" illusion
- The tanker SVG sits centred on the road, bobbing very slightly
- Road lines animate infinitely downward (toward camera) using a `@keyframes` translateY loop
- Green roadside strips on left/right for depth

### Farm Stats Card
A dark card with an emerald accent border, containing:
- Header: "This is your farm:"
- Bullet list (with icons):
  - 5 loads a day
  - 50,000 lb loads
  - 23,000 gallon silo
  - Scaling in and out
  - Sampling manually
- The card gently pulses (scale 1.0 to 1.02) to draw attention

### Technical Changes

**File: `src/game/components/AttractModeV2.tsx`**
- Remove all `ArcadeLeaderboard` imports and usage
- Remove the demo fill level animation (no longer showing fill)
- Replace the 3 feature cards ("SAVE TIME", "OPTIMIZE FILL", "AVOID LOSS") with the road animation viewport and farm stats card
- Add the road animation as an inline CSS animation with `@keyframes roadScroll`
- Use the existing `milk_tanker_full.svg` (the non-transparent version) for the truck on the road
- The farm stats values will be derived from `config` where possible (loadsPerDay, targetLoadLbs) and hardcoded for silo size / sampling method

**File: `src/game/components/AttractModeV2.tsx` (props)**
- Remove `leaderboardEntries` and `getDisplayEntries` from props since leaderboard is gone from this screen

**File: `src/game/FillTheTank.tsx`**
- Update the `AttractModeV2` call to stop passing leaderboard props

