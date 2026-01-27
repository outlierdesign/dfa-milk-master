# Fill the Tank - Trade Show Mini Game

A 30-60 second arcade-style browser game where players fill milk tanks to precise target levels. The closer to the target, the more money they keep.

## How to Run

```sh
npm install
npm run dev
```

Open http://localhost:8080 in your browser. Press F11 for fullscreen mode.

## Game Controls

- **Hold to Fill**: Press and hold the fill button to start filling the tank
- **Release to Stop**: Let go when you think you've hit the target
- **Nudge +50L**: Fine-tune near the target
- **Done**: Confirm your fill level

## Tuning Constants

All game constants are in `src/game/constants.ts`:

### Flow Speed (per level)
```ts
LEVELS: [
  { level: 1, flowRate: 80 },   // Liters per second
  { level: 2, flowRate: 120 },
  { level: 3, flowRate: 180 },
  // ...
]
```

### Tolerance Zones
```ts
LEVELS: [
  { level: 1, tolerance: 500 },  // Liters - how close is "perfect"
  { level: 2, tolerance: 300 },
  { level: 3, tolerance: 200 },
  // ...
]
```

### Money Scale
```ts
BASE_MONEY_PER_LOAD: 10000,     // $10,000 per load
MONEY_PER_TANKER: 25000,        // Money needed to fill one tanker
```

### Timer
```ts
ROUND_DURATION: 60,             // Seconds per round
RESULTS_DISPLAY_TIME: 8000,     // ms before auto-restart
ATTRACT_IDLE_TIME: 12000,       // ms before attract mode
```

## Admin Features

- **Ctrl+Shift+R**: Reset the leaderboard (with confirmation)
- **F11**: Toggle fullscreen mode

## Offline Use

After initial load, the game runs entirely client-side with no external API calls. Leaderboard is stored in localStorage.

## Technologies

- React + TypeScript
- Tailwind CSS
- localStorage for persistence
