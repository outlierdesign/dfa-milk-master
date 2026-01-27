

# Increase Milk Loading Speed 4x

## What We're Changing
Multiplying all flow rates by 4 to make the tank fill faster. This is a simple update to the game constants.

## Current vs New Flow Rates

| Level | Current Speed | New Speed (4x) |
|-------|---------------|----------------|
| Level 1 - Training | 80 L/s | 320 L/s |
| Level 2 - Two Trailers | 120 L/s | 480 L/s |
| Level 3 - Speed Run | 180 L/s | 720 L/s |
| Level 4 - Precision | 200 L/s | 800 L/s |
| Level 5 - Expert | 250 L/s | 1000 L/s |

## File to Update
- `src/game/constants.ts` - Update the `flowRate` value for each level in the `LEVELS` array

## Note
With 4x faster flow, the game will be more challenging since players have less time to react. At Level 1 (320 L/s), a 10,000L tank will fill in about 31 seconds. At Level 5 (1000 L/s), it fills in just 10 seconds.

