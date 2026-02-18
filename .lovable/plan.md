
# Results Screen Redesign: Worked Maths, Red Cost Hero, Two-Column Layout

## What's Changing

Three distinct improvements to the results screen (`ResultsScreenV2.tsx`):

1. **Red cost hero at the top** — Variable cost and Total cost displayed prominently in red at the very top, replacing the current muted "Your Score" header
2. **Worked example panel** — Step-by-step maths showing exactly how the underfill cost was calculated, using real numbers from the player's game
3. **Two-column layout** — Results/breakdown on the left, leaderboard on the right (side-by-side on desktop, stacked on mobile)

---

## 1. Red Cost Hero Header

Replace the current "Your Score" block with a more impactful two-figure display:

```
┌────────────────────────────────────────────────┐
│        ANNUAL VARIABLE COST                    │
│              $12,543          ← large red      │
│        ─────────────────                       │
│  Underfill + Spill    $8,200  ← red            │
│  Time Penalties       $4,343  ← amber          │
│               (lower is better)                │
└────────────────────────────────────────────────┘
```

- Total variable cost in large red (`text-red-400`, `text-6xl font-black`)
- Sub-line shows the core cost (underfill + spill) and time penalties separately in smaller red/amber text
- Clear label: "ANNUAL VARIABLE COST — lower is better"

---

## 2. Worked Example Panel

A new panel inserted between the round breakdown and the annualised cost breakdown. It walks through the underfill cost maths step by step. The panel only shows for underfill scenarios (extraLoads > 0).

**Structure** (using real numbers from `score` and `config`):

```
HOW YOUR UNDERFILL COST WAS CALCULATED

Step 1 — Avg credited per load
  You filled: [avgCredited] lbs  (weighted avg across rounds)

Step 2 — Annual milk target
  [targetLoadLbs] lbs × [N] loads = [annualMilkBaseline] lbs/year
  (e.g. 50,000 × 1,824 = 91,200,000)

Step 3 — Extra loads needed
  91,200,000 ÷ [avgCredited] = [actualLoads] loads needed
  [actualLoads] − [N] = [extraLoads] extra trips

Step 4 — Underfill cost
  [extraLoads] trips × $500/trip = $[underfillCost]
```

Each step is a separate styled row with a step number chip on the left, a plain-English label, and the computed value right-aligned in amber/white.

For spill cost, a separate compact worked line:
```
Spill: [totalSpillLbs annualised] lbs × $0.19/lb = $[spillCost]
```

This panel is wrapped in `animate-fade-in` triggered by the same `showAnnualized` timer (1.5s delay).

---

## 3. Two-Column Desktop Layout

On desktop (md+), the page switches from a single centred column to a side-by-side grid:

```
┌─────────────────────────────────────────────────────────┐
│                     COST HERO (full width)              │
├────────────────────────┬────────────────────────────────┤
│   LEFT COLUMN          │   RIGHT COLUMN                 │
│                        │                                │
│   Round Breakdown      │   LEADERBOARD                  │
│   Worked Example       │   (arcade styled, sticky top)  │
│   Annualised Costs     │                                │
│   Piper/Weighbridge    │                                │
│   Piper CTA            │                                │
│                        │                                │
├────────────────────────┴────────────────────────────────┤
│                  PLAY AGAIN (full width)                │
└─────────────────────────────────────────────────────────┘
```

- Outer container: `max-w-5xl mx-auto` (wider than the current `max-w-lg`)
- Cost hero: full-width across the top
- Content area: `grid grid-cols-1 md:grid-cols-2 gap-6`
- Left col: all the breakdown panels
- Right col: `ArcadeLeaderboard` with `md:sticky md:top-6` so it stays visible while the user scrolls through the breakdown
- Play Again button: full width below the grid
- On mobile: single column, leaderboard appears below all panels (same as today)

---

## Files to Change

### `src/game/components/ResultsScreenV2.tsx`

- Replace the `<div className="min-h-screen ... flex flex-col items-center">` root with a wider `max-w-5xl` container using a CSS grid layout
- Rewrite the score header as the red cost hero (two figures: total variable cost + core cost split)
- Add a new inline `WorkedExample` sub-component (or JSX block) between round breakdown and annualised costs — no new file needed
- Move `<ArcadeLeaderboard>` into the right column of the grid
- Play Again button stays full-width at the bottom

No other files need changing — all required data (`score`, `config`, `rounds`) is already available in this component.
