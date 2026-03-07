

# Infinite 8-Bit Road Animation

Replace the static `road_scene_pixel.png` background with a fully procedural SVG scene that animates like a classic 8-bit driving game (Outrun / Rad Racer style). The entire road, sky, and fields will be drawn and animated in SVG, giving the illusion of driving forward down an endless road.

## What You'll See

- A sky gradient (light blue to warm horizon glow)
- Alternating green field bands (light green / dark green) that scroll toward the viewer from the vanishing point, creating the classic "infinite road" stripe effect
- A grey road with white edge lines converging to a vanishing point
- Animated yellow centre dashes rushing toward the camera
- Simple 8-bit tree silhouettes on the horizon
- The `driver_view.svg` windshield overlay on top (unchanged)
- CRT scanline overlay (unchanged)

## Technical Details

**File changed:** `src/game/components/AttractModeV2.tsx`

1. **Remove the static PNG background** -- the `roadScene` import and `<img>` tag will be replaced by an inline SVG that fills the viewport.

2. **Procedural SVG scene** built with these layers:
   - **Sky**: A `<linearGradient>` rectangle from pale blue (#87CEEB) at top to warm peach (#FFD4A0) at the horizon line (~40% down).
   - **Field bands**: ~20 horizontal trapezoid strips from the vanishing point downward, alternating between two greens (#3A7D2C and #4CA83A). These will be wrapped in a `<g>` with an `<animateTransform>` that translates them downward in a loop, making them appear to scroll toward the viewer.
   - **Road**: A dark grey trapezoid (#555) narrowing from the bottom edge to the vanishing point, with white edge lines.
   - **Centre dashes**: The existing animated yellow dash overlay (already working) stays as-is.
   - **Horizon trees**: A few simple triangular tree shapes at the horizon line for depth.

3. **Animation approach**: The field bands use `<animateTransform type="translate">` looping every ~0.6s, shifting bands downward by one band-height so they appear to stream toward the camera seamlessly. Each band is sized based on perspective (narrow at vanishing point, wide at bottom).

4. **Cleanup**: Remove the `driveZoom` keyframe animation and `roadScene` image import since they're no longer needed. Keep `cardPulse` for the stats card.
