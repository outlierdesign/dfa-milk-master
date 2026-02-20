

## Fine-tune Barrel Fill Bounds in TankerV2

### What's Wrong

From the live screenshots, the dark interior background and milk fill extend outside the barrel window of the SVG on multiple sides:
- **Bottom**: Fill bleeds below the barrel outline into the chassis/wheel area
- **Left**: Fill extends past the left edge of the barrel curve
- **Top**: Slight bleed above the barrel top line
- **Right**: Minor bleed past the barrel end

### The Fix

**File:** `src/game/components/TankerV2.tsx`

Increase all four `BARREL` inset values to pull the fill area tighter inside the transparent window:

```typescript
const BARREL = {
  left: 42,     // was 30 -- barrel curve starts further right
  top: 46,      // was 40 -- barrel top edge sits lower
  right: 186,   // was 178 -- barrel ends further from the cab
  bottom: 96,   // was 84 -- barrel bottom is well above the chassis
};
```

### Technical Details

- These are pixel offsets at the 512x200 render size
- `left` / `right` reduce the width of the fill rectangle; `top` / `bottom` reduce the height
- The resulting fill area will be: width = 512 - 42 - 186 = 284px, height = 200 - 46 - 96 = 58px (was 304x76)
- No other code changes needed -- all fill, target line, overfill flash, and compartment ribs use these same bounds
- May still need one more small tweak after visual verification

