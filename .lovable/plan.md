
# Enable Scrolling on Results Screen

## Problem Identified

The Results screen content gets cut off on mobile, iPad, and desktop because:

1. **Parent container blocks scrolling**: `FillTheTank.tsx` uses `overflow-hidden` on line 124, which prevents any child component from scrolling - even though `ResultsScreenV2` already has `overflow-y-auto` applied.

2. **Content exceeds viewport**: The Results screen contains:
   - Piper logo
   - Header with accuracy
   - Load Receipt (detailed breakdown)
   - Annualized Impact section (appears after 1.5s)
   - Piper Message
   - Play Again button

   On smaller screens, this content exceeds the viewport height.

---

## Solution

Change the parent container's overflow behavior based on the current game state:

- **During gameplay**: Keep `overflow-hidden` to prevent accidental scrolling while filling
- **On results screen**: Use `overflow-auto` to allow scrolling through all results

This is a simple, targeted fix that preserves the current behavior for other screens.

---

## Technical Changes

### File: `src/game/FillTheTank.tsx`

**Current code (line 124):**
```tsx
<div className="w-full h-screen overflow-hidden bg-slate-900">
```

**Updated code:**
```tsx
<div className={`w-full h-screen bg-slate-900 ${
  gameState === "results" ? "overflow-auto" : "overflow-hidden"
}`}>
```

This dynamically switches overflow based on game state:
- `attract`, `questions`, `playing`, `penaltyReveal`, `leadCapture` → `overflow-hidden`
- `results` → `overflow-auto`

---

## Additional Enhancement (Optional)

To ensure smooth scrolling and proper mobile behavior, we can also add:

### File: `src/game/components/ResultsScreenV2.tsx`

Add bottom padding to ensure the "Play Again" button isn't cut off at the very bottom:

**Current (line 167-174):**
```tsx
<div className="mt-8 w-full max-w-lg">
```

**Updated:**
```tsx
<div className="mt-8 mb-8 w-full max-w-lg">
```

And add `pb-8` (padding-bottom) to the main container to give breathing room at the bottom for mobile browsers that have address bars.

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/game/FillTheTank.tsx` | Conditional overflow class based on `gameState` |
| `src/game/components/ResultsScreenV2.tsx` | Add bottom margin/padding for better scroll UX |

---

## Alternative Considered

I also considered making the Results screen content more compact (smaller fonts, less padding) to fit without scrolling. However, this would:
- Reduce readability
- Make the important cost/impact information harder to see
- Conflict with the trade show use case where visibility is important

**Scrolling is the better solution** because:
- Preserves the current visual design
- Works consistently across all device sizes
- Allows users to see all information
- Is a standard mobile pattern users expect
