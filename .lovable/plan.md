
## Upgrade: 16-Bit Pixel Art Tanker + Weighbridge Station with Veeder-Root Meter

### What's Being Built

Three visual upgrades across two components:

1. **TankerV2 — 16-bit pixel art style, facing right** (cab on the right, trailer on the left — so milk flows left-to-right from farm tank into the cab-side of the truck, which is the correct driving direction)
2. **WeighbridgeDepartureOverlay — full weigh station scene** with the truck arriving/driving onto a large platform scale, then a Veeder-Root-style electromechanical digit display revealing the load weight
3. **The uploaded GLB voxel model** will be copied into the project assets for potential future use, but the primary rendering remains CSS/SVG pixel art (no Three.js dependency required — more reliable for a trade show kiosk, no WebGL fallback risks)

---

### Visual Design Direction

#### 1. 16-Bit Tanker (TankerV2)

Replace the current smooth-gradient CSS truck with a chunky, hard-edged pixel art aesthetic:

- **No border-radius** — all sharp corners to simulate pixel blocks
- **Dithered shading** — alternating pixel-row colours to simulate 16-bit depth
- **Limited colour palette** — flat blocks of colour with 2-tone shadow/highlight (no CSS gradients, or 2-stop max at hard stops)
- **Direction reversed** — cab moves to the **right side**, trailer extends to the **left** (so the truck faces right, ready to drive off to the weighbridge)
- **Pixel-style wheels** — square/octagonal rather than circular
- **"MILK" lettering** — bold, pixel-font style on the tank body
- **Fill level** visible through a chunky "window" cut-out on the trailer side

Layout (left → right):
```text
[════════════════TANK TRAILER════════════════][■CAB■]
       ◉          ◉          ◉           ◉ ◉
```

#### 2. Farm Tank

Updated to face the correct direction (pipe exits from the right side toward the tanker trailer's intake valve).

#### 3. WeighbridgeDepartureOverlay — Full Redesign

**Phase 1: Truck arrival (0–2s)**
- Dark background with a road/tarmac strip
- Weigh station platform: a large flat rectangular pad with "WEIGHBRIDGE" stencilled across it, bolts/sensors visible at each corner
- The 16-bit truck CSS graphic slides in **from the left** and comes to rest centred on the platform (drives onto scale)
- Platform visually "sinks" slightly (scale compression animation) as the truck lands

**Phase 2: Veeder-Root Meter display (2–4.5s)**
- A large instrument panel appears above the scale
- Styled after a **Veeder-Root mechanical counter** — dark housing, individual digit rollers, amber/green backlight
- Each digit "rolls up" sequentially (slot-machine style animation) from `00000` to the actual weight in lbs
- Format: `50,000 lbs` displayed in 5 individual digit drums
- Digits animate with a fast upward scroll then settle, one column at a time left-to-right
- The unit label `LBS` is shown in a separate fixed display to the right
- A status line below reads `TARE: 28,460 lbs` and `GROSS: XX,XXX lbs` (flavour text, not real values)

**Phase 3: Result banner (4.5–6s)**
- "Gone to Weighbridge" text fades in beneath the meter
- 3 animated dots indicate calculation in progress
- Auto-advances to Round Result screen

---

### Technical Implementation

#### Files to Modify

**`src/game/components/TankerV2.tsx`**
- Complete rewrite of the JSX using pixel-art CSS design
- Layout flipped: trailer on left, cab on right
- Props interface unchanged — all existing game logic continues to work
- Fill level indicator, target line, overfill state all preserved

**`src/game/components/WeighbridgeDepartureOverlay.tsx`**
- Phase state expanded: `"arriving" | "weighing" | "displaying" | "banner"`
- New `WeighStation` sub-component: road + platform + bolts
- New `VeederRootMeter` sub-component: digit drums with roll-up animation
- The digit roll animation uses CSS `@keyframes` with `overflow: hidden` + `translateY` on a stacked column of 0–9 digits
- `onComplete` callback timing extended to ~6 seconds total to accommodate the longer animation sequence
- The actual fill weight (in lbs) needs to be passed down as a prop so the meter can display it — this requires a small prop addition

**`src/game/components/GameScreenV2.tsx`**
- Pass `session.currentFill` (or the locked fill amount) to `WeighbridgeDepartureOverlay` as a new `fillLbs` prop

**`public/models/` (asset copy)**
- The uploaded GLB `Meshy_AI_Blue_Voxel_Tanker_Tru_0220194605_texture.glb` will be copied to `public/models/voxel-tanker.glb` for future use

---

### Timing Sequence for WeighbridgeDepartureOverlay

| Time | Event |
|------|-------|
| 0ms | Truck slides in from left, drives onto weighbridge platform |
| 1200ms | Truck stops on platform, platform "compresses" |
| 1800ms | Veeder-Root meter panel slides down from top |
| 2200ms | Digit drums begin rolling (left digit first) |
| 3800ms | All digits settled — final weight displayed |
| 4200ms | "Gone to Weighbridge" banner fades in |
| 5500ms | `onComplete()` called → advances to Round Result |

---

### Prop Change Required

`WeighbridgeDepartureOverlay` needs one new prop:

```ts
interface WeighbridgeDepartureOverlayProps {
  onComplete: () => void;
  fillLbs: number; // the actual weight loaded this round — shown on the meter
}
```

In `GameScreenV2.tsx`, this will be passed as `fillLbs={session.currentFill}`.

---

### What Stays the Same

- All game logic, state machine, and scoring — untouched
- `AgitationOverlay` — untouched
- `FarmTank`, `ConnectionPipe`, `GameTimer` — untouched
- All existing props on `TankerV2` — interface unchanged

### Files to Create

- `public/models/voxel-tanker.glb` (copied from upload, for future use)

### Files to Modify

| File | Change |
|------|--------|
| `src/game/components/TankerV2.tsx` | Full 16-bit pixel art redesign, facing right |
| `src/game/components/WeighbridgeDepartureOverlay.tsx` | Full redesign: weighbridge scene + Veeder-Root meter |
| `src/game/components/GameScreenV2.tsx` | Pass `fillLbs` prop to `WeighbridgeDepartureOverlay` |
