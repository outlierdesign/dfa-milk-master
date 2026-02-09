

# Add Leaderboard to Results Screen

## Overview

Show the leaderboard at the bottom of the results screen after the game ends, and save the player's score to it. Currently the leaderboard hook (`useLeaderboard`) exists and is used on the attract screen, but scores are never actually saved to it.

## Changes

### 1. Pass leaderboard data and save function to ResultsScreenV2

**File: `src/game/FillTheTank.tsx`**
- Pass `leaderboardEntries={entries}`, `onAddEntry={addEntry}`, and `config` to `ResultsScreenV2`
- The player's score will be saved when the results screen mounts

### 2. Display leaderboard on the results screen

**File: `src/game/components/ResultsScreenV2.tsx`**
- Add `leaderboardEntries` and `onAddEntry` props
- On mount, call `onAddEntry` with the player's score data (using "Player" as default name since lead capture may have been skipped)
- After the Piper CTA section, render a leaderboard table showing today's top scores (same style as the attract screen but integrated into the results layout)
- Highlight the current player's entry in the leaderboard

### 3. Pass player name through from lead capture (optional enhancement)

**File: `src/game/FillTheTank.tsx`**
- Store the player name from lead capture (if provided) in a ref
- Pass it to the results screen so the leaderboard entry uses their actual name instead of "Player"

## Technical Details

- The leaderboard is localStorage-based and filtered to today's entries only
- Scores are sorted by lowest cost (lower is better)
- Max 10 entries stored
- The `addEntry` function takes: `playerName`, `score`, `accuracy`, `tankersFilled`, and optionally `settings`
- The score value to save is `score.totalVariableCost` from the scoring engine

