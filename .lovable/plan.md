
## Two Fixes + Tanker Visual Discussion

### Fix 1 — Weighbridge Shows Spilled Milk Weight (Logic Bug)

**The problem:** The Veeder-Root meter currently displays `session.currentFill` passed as `fillLbs`. If the tanker overflows to 52,000 lbs, the meter shows `52,000 lbs`. But 2,000 of those pounds spilled on the ground — the tanker only physically contains 50,000 lbs. The weighbridge should only weigh what is inside the tanker.

**The correct value to display is `creditedLbs`** — which is already calculated correctly in `advanceFromWeighbridge()` as `Math.min(fillLbs, cfg.targetLoadLbs)`. However, at the time the overlay is shown, the round result hasn't been calculated yet (it's calculated *after* the overlay completes). So we need to pass the capped value directly.

**Fix:** In `GameScreenV2.tsx`, change the `fillLbs` prop passed to `WeighbridgeDepartureOverlay` from `session.currentFill` to `Math.min(session.currentFill, config.targetLoadLbs)`. This is a one-line change.

The spill cost (`spillLbs * milkCostPerLb`) already flows through the scoring engine correctly — this fix only corrects what is *displayed on the weighbridge scale*, which is the physical weight of milk inside the tanker.

Additionally, the GROSS weight on the status line below the meter (`rounded + 28,460`) should also use this capped value, which is automatically fixed by fixing the prop.

---

### Fix 2 — Make the Tanker Transparent (See-Through Barrel)

**The problem:** The tanker body currently uses an opaque stainless steel background (`#cbd5e1` / `#94a3b8` gradient). The milk fill is only visible through a small 40px-wide "window" cutout on the left of the trailer. The user wants the entire barrel to be see-through so the milk level fills the full width of the tank.

**The fix:** Replace the opaque tank body background with a transparent/semi-transparent shell approach:
- The barrel becomes a **dark interior** (deep blue-black, like the inside of a steel tank) so that the milk shows against a dark background rather than being a small window.
- The milk fill rises from the bottom of the full barrel area.
- The tank "walls" are rendered as a **border/frame overlay** (pixel-art style) on top of the liquid, rather than an opaque background behind it. This gives the impression of looking at the tank cross-section.
- The vertical segment dividers (pixel ribs at 25%, 50%, 75%) remain on top of the liquid layer, showing the compartment structure.
- The "MILK" label and target line remain visible as overlays.
- The stainless steel effect is moved to just the **top rim, end caps, and domes** — the barrel interior is transparent to the milk.

This requires restructuring the z-layering in `TankerV2.tsx`:
1. **Layer 0 (bottom):** Dark barrel interior background (`#0f172a`)
2. **Layer 1:** Milk fill div rising from bottom — full width of the barrel
3. **Layer 2:** Segment rib dividers (semi-transparent dark bars)
4. **Layer 3:** Top-surface highlight strip (2px of white at very top for metallic rim effect)
5. **Layer 4:** "MILK" text, target line, overfill flash — all on top

The fill window cutout (`left: 12, width: 40`) is removed entirely, replaced by the full-width fill approach.

---

### On Improving the Truck/Tanker Graphic

Regarding what can be uploaded or used to improve the visual quality beyond CSS pixel art:

**What can be uploaded and used directly:**
- **SVG files** — The highest-quality option. A detailed SVG of a milk tanker (side elevation, 16-bit art style) can be dropped into `src/assets/` and rendered at any size with zero blur. If you have a vector illustration or can export one from Adobe Illustrator, Figma, or Inkscape, this would give the best result.
- **PNG/WebP sprites** — A pixel-art PNG (e.g. 512×200 or 1024×400 pixels, drawn at exact pixel resolution) renders crisply with `image-rendering: pixelated`. If you have access to a pixel-art tool (Aseprite, LibreSprite, Photoshop) you could export a tanker sprite at 2x resolution.
- **The uploaded GLB model** — The voxel tanker GLB already in the project (`public/models/voxel-tanker.glb`) could be rendered using a lightweight 3D viewer (`<model-viewer>` web component or Three.js). This would give true 3D rotation and lighting. However it adds a JavaScript dependency and WebGL requirement — riskier for a trade show kiosk.

**Recommended path (no extra tools needed):**
The CSS pixel-art approach can be significantly improved within the current stack. The main visual improvements that would make the biggest difference are:
1. Making the barrel transparent (Fix 2 above) so you see milk filling the tank
2. Adding more detail to the cab — a larger windscreen, door handle, fuel tank, side mirror pixel blocks
3. Adding a chrome/silver shine strip along the top of the barrel (2-3px white line)
4. Using a more detailed wheel with lug nut dots around the hub

**If you have access to a design tool:** Export a 512×200 PNG of a side-on milk tanker in pixel art style (facing right, transparent background), upload it here, and the tanker component can switch to rendering that image with the milk fill overlaid using CSS `clip-path` and `mix-blend-mode`. That would give the crispest result.

---

### Files to Change

| File | Change |
|---|---|
| `src/game/components/GameScreenV2.tsx` | Change `fillLbs={session.currentFill}` → `fillLbs={Math.min(session.currentFill, config.targetLoadLbs)}` |
| `src/game/components/TankerV2.tsx` | Replace small fill window with full-width transparent barrel showing milk filling the entire tank cross-section |

---

### Summary of Weighbridge Weight Logic

| Scenario | Tank contains | Spilled | Weighbridge reads |
|---|---|---|---|
| Perfect fill (50,000 lbs) | 50,000 | 0 | 50,000 lbs ✓ |
| Underfill (47,500 lbs) | 47,500 | 0 | 47,500 lbs ✓ |
| Overfill (52,000 lbs capped) | 50,000 | 2,000 (on ground) | 50,000 lbs ✓ (currently shows 52,000 — bug) |

The spill cost (`2,000 lbs × $0.19 = $380`) still flows through the scoring engine correctly via `spillLbs` — only the *displayed* weighbridge reading is wrong and will be corrected.
