

# Persistent All-Time Leaderboard with 80s Arcade Styling

## Overview

Three major changes:
1. **All-time leaderboard** -- remove the "today only" filter, keep ALL entries forever
2. **Top 20 benchmark + contextual placement** -- the top 20 are the permanent benchmark; if a player lands outside the top 20, show the top 20 plus their placing at the bottom
3. **80s arcade pixel styling** -- restyle the leaderboard with retro 8-bit aesthetics (pixelated font, scanline effects, star decorations, arcade banner) while keeping the existing slate/emerald/red color scheme

## Changes

### 1. Update Leaderboard Hook -- All-Time Storage

**File: `src/game/hooks/useLeaderboard.ts`**
- Remove the "today only" filter on load (line 24) -- load ALL stored entries
- Increase `MAX_ENTRIES` storage to a large number (e.g. 1000) so all scores persist
- Add a new return value: `getDisplayEntries(currentEntryId)` that returns `{ top20: LeaderboardEntry[], playerEntry: { entry, rank } | null }` -- if the player is in the top 20, just return top 20; if not, return top 20 + their rank/entry separately

**File: `src/game/constants.ts`**
- Change `LEADERBOARD_CONFIG.MAX_ENTRIES` from `10` to `1000`

### 2. Update Results Screen Leaderboard Display

**File: `src/game/components/ResultsScreenV2.tsx`**
- Replace the current simple leaderboard table with an arcade-styled component
- Use `getDisplayEntries` to determine what to show:
  - Always show top 20
  - If the current player is outside top 20, add a separator row ("...") then their rank and score at the bottom
  - Highlight the current player's row with a glowing effect

### 3. Update Attract Screen Leaderboard

**File: `src/game/components/AttractModeV2.tsx`**
- Update to show all-time top 5 (remove "TODAY" label, show "TOP SCORES")
- Apply matching arcade pixel styling

### 4. 80s Arcade Pixel Styling

**File: `src/index.css`**
- Import a pixel font (e.g. "Press Start 2P" from Google Fonts or use a CSS pixel-font fallback)
- Add a `.arcade-leaderboard` utility class with pixelated border styling

**File: `index.html`**
- Add Google Fonts link for "Press Start 2P"

**Visual design (matching reference image + existing color scheme):**
- Pixelated banner header reading "LEADERBOARD" in uppercase with star decorations
- Red/crimson banner ribbon behind the title (using existing red-400/red-500)
- Black background panel with a stepped/pixelated border (using slate-700/slate-800)
- Each row: rank number, player name in pixel font, score right-aligned
- Top 3 get gold/silver/bronze star indicators
- Current player row gets a pulsing emerald glow border
- Separator row with pixelated dots for the "..." gap between top 20 and player's rank
- All text uses the pixel font at a small size for authentic retro feel

## Technical Details

- The `LeaderboardEntry` type stays the same -- no schema changes needed
- Storage key remains the same, existing localStorage data will be loaded (old today-only entries will now persist)
- The `addEntry` function still sorts by lowest score and appends; the display logic in `getDisplayEntries` handles the top-20 + player-rank split
- The attract screen continues to show a compact top-5 view
- No database migration needed -- this remains localStorage-based

