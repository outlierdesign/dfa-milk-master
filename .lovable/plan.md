

# Fill The Tank - Milk Tanker Game

## Recent Changes

### Horizontal Milk Tanker with Compartments
- Created new `MilkTanker` component with realistic horizontal tanker design
- Tanker shows truck cab with attached cylindrical tank body
- Multiple compartments that visually divide the tank
- Each compartment fills individually with animated liquid

### Level Progression
| Level | Name | Compartments | Flow Rate | Fill Time (~per compartment) |
|-------|------|--------------|-----------|------------------------------|
| 1 | Single Tank | 1 | 500 L/s | ~16s |
| 2 | Double Tank | 2 | 650 L/s | ~12s |
| 3 | Triple Tank | 3 | 800 L/s | ~10s |
| 4 | Quad Tank | 4 | 1000 L/s | ~8s |
| 5 | Full Tanker | 5 | 1200 L/s | ~7s |

### Timer Change
- Timer now counts UP (elapsed time) instead of counting down
- Shows how fast you completed the load - lower time = better

### Files Updated
- `src/game/components/MilkTanker.tsx` - New horizontal tanker with compartments
- `src/game/components/GameScreen.tsx` - Uses MilkTanker instead of Tank
- `src/game/components/GameHUD.tsx` - Shows elapsed time, compartments instead of trailers
- `src/game/hooks/useGameState.ts` - Tracks compartment fill levels, elapsed time
- `src/game/types.ts` - Updated types for compartments
- `src/game/constants.ts` - New level config with compartments
