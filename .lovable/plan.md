

## Fix: Recalibrate Barrel Fill Bounds in TankerV2

### The Problem

The milk fill area (dark background + rising milk) extends outside the transparent barrel window of the SVG tanker graphic on all four sides. The `BARREL` constants that define the fill region don't match the actual transparent area in the new SVG.

From the live screenshot during filling, the dark fill rectangle is visible:
- Above the barrel outline (top inset too small)
- Below the barrel outline (bottom inset too small)  
- To the left of the barrel start (left inset too small)
- Past the barrel end on the right (right inset too small)

### The Fix

**File:** `src/game/components/TankerV2.tsx`

Update the `BARREL` constants to tighten the fill region so it sits precisely inside the SVG's transparent window:

```typescript
const BARREL = {
  left: 62,     // was 46 — barrel outline starts further right
  top: 32,      // was 18 — barrel top edge is lower
  right: 140,   // was 124 — barrel ends further from right edge
  bottom: 62,   // was 52 — barrel bottom edge is higher
};
```

These values are based on visual inspection of the rendered tanker at 512x200 pixels. They may need one more small tweak after seeing the result, but this should get the fill much closer to the transparent window bounds.

### What Stays the Same

- All game logic, fill calculations, target line, overfill effects — unchanged
- The SVG graphic itself — unchanged
- The milk colour (already matched to FarmTank) — unchanged
