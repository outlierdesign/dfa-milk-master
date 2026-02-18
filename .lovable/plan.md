
# Fix Two-Column Layout Not Appearing on Results Screen

## Root Cause

The two-column layout code is correctly written in `ResultsScreenV2.tsx` using `grid-cols-1 md:grid-cols-2`. The issue is that Tailwind's `md:` breakpoint requires a viewport width of at least **768px** to activate.

The game is designed to run in full-screen kiosk mode (or near-full-screen), but in the Lovable preview panel the iframe is narrower than 768px, so the responsive grid always collapses to a single column.

Even in production, if the game is displayed in an embedded or tablet-width window, `md:` will be too wide a threshold. The fix is to **lower the breakpoint** so the two-column layout kicks in at a narrower width — or use a fixed `grid-cols-2` that always applies, with the columns simply scaling down on small screens.

## The Fix

Two changes in `ResultsScreenV2.tsx`:

### 1. Change the grid breakpoint from `md:` to `sm:`

Tailwind's `sm:` breakpoint is 640px — much more likely to be hit in the Lovable preview and on a standard tablet in landscape.

```
// BEFORE
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
...
<div className="hidden md:block">  ← right column
<div className="md:hidden">        ← mobile leaderboard

// AFTER
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
...
<div className="hidden sm:block">  ← right column
<div className="sm:hidden">        ← mobile leaderboard
```

### 2. Match the sticky breakpoint

```
// BEFORE
<div className="md:sticky md:top-6">

// AFTER  
<div className="sm:sticky sm:top-6">
```

That's all — 4 occurrences of `md:` changed to `sm:` within the grid section of `ResultsScreenV2.tsx`. No logic changes, no data changes, no new files.

## Why `sm:` Is the Right Choice

| Breakpoint | Min width | Typical device |
|---|---|---|
| `sm:` | 640px | Large phone landscape, small tablet, preview panel |
| `md:` | 768px | iPad portrait — often still too wide for the preview |

The results screen is already `max-w-5xl` wide so there is plenty of room once the breakpoint triggers. At 640px, each column gets ~310px which is enough for both the breakdown panels and the leaderboard.

## File to Change

`src/game/components/ResultsScreenV2.tsx` — 4 class name replacements, no logic changes.
