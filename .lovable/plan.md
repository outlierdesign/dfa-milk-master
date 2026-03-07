

## Plan: Two Changes

### 1. Farm Tank Fan — Match Agitation Overlay Style

In `src/game/components/FarmTank.tsx`, replace the current fan SVG (lines 28-43) with the overlay's styling:
- Increase size from `w-10 h-10` to `w-14 h-14`
- Change color from `text-slate-400/60` to `text-amber-400`
- Speed up from `3s` to `1.2s` animation duration
- Increase blade opacity from `0.7` to `0.9`

### 2. Weighbridge Overlay — Clean Up Text Layout

In `src/game/components/WeighbridgeDepartureOverlay.tsx`:
- Move the "Gone to Weighbridge" banner higher and increase font size for better readability
- Center-align the Veeder-Root meter label text and status line more consistently
- Adjust the meter panel width and positioning for cleaner alignment
- Ensure the TARE/GROSS status line has consistent spacing and sizing
- Increase bottom padding on the banner section so text doesn't crowd the road/truck area

