

## What I Need You to Generate

Here is exactly what to create for the transparent tanker cutaway:

### Asset: "Tanker Shell" SVG or PNG

**What it should look like:**
A semi-realistic side-view illustration of a milk tanker trailer (no cab/truck — just the cylindrical tank on wheels/chassis). The tank body should be rendered as a **transparent glass/x-ray cutaway** — you can see through the walls. Think of it like a cross-section or a technical blueprint view.

**Specific requirements:**

1. **Dimensions**: 512px wide x 200px tall (or similar ~2.5:1 aspect ratio)
2. **Tank barrel interior**: Completely **transparent (alpha = 0)** — this is the area where I will layer the animated milk fill behind it
3. **What to render opaque:**
   - The tank's outer shell outline/frame (thin semi-transparent steel border, like frosted glass edges)
   - Wheels and axle assembly at the bottom
   - The rear valve/outlet
   - Top hatch(es) — one or two circular hatches on top of the barrel
   - Any structural ribs or bands around the barrel (rendered as thin lines, not solid)
4. **What must be transparent:**
   - The entire interior area of the barrel — from the inner bottom curve to the inner top curve
   - This transparent zone should follow the **curved inner contour** of a cylindrical tank (rounded top and bottom, not rectangular)
5. **Style**: Semi-realistic with subtle metallic shading on the frame elements, industrial look. Not cartoonish, not photorealistic — like a technical illustration you'd see in a training manual
6. **Background**: Fully transparent PNG (or SVG with no background fill)
7. **Single continuous tank**: No internal compartment dividers — one open volume

### How I Will Use It

The component layers three things:
```text
┌─────────────────────────────────┐
│  Layer 3: Tanker shell PNG/SVG  │  ← Your asset (frame only, interior transparent)
│  Layer 2: Target line overlay   │  ← Green line at target fill height
│  Layer 1: Milk fill div         │  ← White/cream rectangle that rises from bottom
│  Layer 0: Dark background       │  ← Dark interior behind everything
└─────────────────────────────────┘
```

The milk fill (Layer 1) rises from the bottom behind the transparent shell. The curved edges of your shell asset naturally clip the visual, making the milk appear to follow the barrel's cylindrical shape.

### What I Will Add in Code

Once you provide the asset:
- **Fluid surface animation**: Ripple/wave effect on the milk surface using CSS keyframes
- **Sloshing on stop**: When filling stops, a brief sine-wave wobble on the surface
- **Fill gradient**: Creamy white gradient with subtle foam/froth at the top
- **Compartment ribs**: Faint overlay lines if desired (already in code)

### Summary

Generate **one PNG** (preferred for semi-realistic style) at **512x200px** or **1024x400px** (2x for retina):
- Side view of a milk tanker trailer
- Glass/cutaway barrel with **transparent interior**
- Opaque: frame outline, wheels, hatches, structural bands
- Transparent: entire barrel interior following the curved tank shape
- Semi-realistic industrial illustration style
- Transparent background

