

## Plan: Three Changes

### 1. Farm Tank Fan — Fix to Rotate in Place (Not Translate)

The fan in `FarmTank.tsx` already uses `animate-spin` which rotates in place (same as the agitation overlay). The fan is identical to the overlay version. Both use the same SVG, same `animate-spin`, same `1.2s` duration. The fan is stationary and spinning — it does not move left/right.

**Action**: Verify on device. If there's a perceived left-right movement, it may be due to the SVG center not being perfectly centered. I'll ensure the fan SVG is properly centered within the tank by anchoring it with `left-1/2 -translate-x-1/2` and confirming the viewBox origin. No substantive code change expected — both fans already match.

### 2. Weighbridge Overlay — Reposition Counter and Banner

**`src/game/components/WeighbridgeDepartureOverlay.tsx`**:

- **Veeder-Root meter**: Move from `top: 20` to vertical center of the screen (`top: 50%, transform: translateY(-50%)`) so the counter sits mid-screen
- **"Gone to Weighbridge" banner**: Move up from `bottom: 160` to roughly `bottom: 280` (~120px higher), so it's more visible above the truck
- Add responsive adjustments: on smaller screens (via media query or responsive classes), scale down the meter panel width and adjust positioning for tablet/mobile

### 3. Agitation Overlay — Add Ticking Clock Sound

**`src/game/hooks/useSoundEffects.ts`**:
- Add `startTickLoop()` and `stopTickLoop()` methods — a rhythmic tick sound using Web Audio API (short high-frequency click at ~2 ticks/second, like a clock)
- Expose in the `SoundEffects` interface

**`src/game/components/AgitationOverlay.tsx`**:
- Import and use `useSoundEffects` 
- Call `startTickLoop()` on mount, `stopTickLoop()` on unmount/completion
- The tick creates urgency and reinforces the "wasted time" message

**Tick sound implementation**: Short 1000Hz sine tone (30ms duration) fired every 500ms via a `setInterval`, creating a clock-tick rhythm. Volume-controlled and mute-aware like all other sounds.

