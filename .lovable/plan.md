

# Fill the Tank - Trade Show Mini Game

## Overview
A 30-60 second arcade-style browser game where players fill milk tanks to precise target levels. The closer to the target, the more money they keep. Designed for trade show engagement with attract mode, leaderboard, and offline capability.

---

## Phase 1: Core Game Engine & Basic Mechanics

### Game State Management
- Create game state machine (Attract → Playing → Results → Attract)
- Implement level progression system (Levels 1-5+)
- Build scoring engine with tunable constants for flow speed, tolerance, and money calculations

### Tank Filling Mechanic
- Press-and-hold to fill / release to stop
- Real-time fill level animation with smooth liquid rise
- Target line indicator with proximity feedback
- Optional "Nudge" button for fine-tuning near target

---

## Phase 2: Visual Design & UI

### American Dairy Aesthetic
- Clean stainless steel tank graphic with fill states
- Dairy yard background (soft focus, barn hints, safety signage)
- Milk tanker trailer icons for multi-trailer levels

### Single-Screen Game Layout
- **Center:** Large tank with rising liquid animation
- **Right:** Target line marker + Stop/Release indicator
- **Top:** Timer, current level, "Tankers Filled" progress
- **Bottom:** Money bar showing money kept in real-time

### UI Elements
- Big, readable numbers and buttons (touch-friendly)
- No jargon - simple phrases: "Fill to the line", "Stop on target", "Closer = less loss"

---

## Phase 3: Level System & Difficulty Progression

### Level 1 - Training
- Single trailer, slow flow rate
- Large tolerance zone around target
- Tutorial overlay: "Fill to the line"

### Level 2 - Two Trailers
- Fill Trailer A to target, then switch to Trailer B
- Medium flow rate, moderate tolerance

### Level 3+ - Challenge Mode
- Faster flow rates, tighter tolerances
- Quick confirmation step between trailers ("Confirm sample taken")
- Visual distractions/notifications to simulate real-world conditions

---

## Phase 4: Scoring & Feedback System

### Accuracy & Money Calculation
- Calculate accuracy as percentage based on distance from target
- Money kept scales with accuracy (e.g., 99.3% accuracy = $9,930 of $10,000)
- Display spillage/loss amount

### Tankers Filled Progress
- Progress bar showing cumulative tankers filled
- Higher accuracy = faster progress toward next tanker

### Satisfying Feedback
- Liquid fill sound effects (hooks for audio)
- Success chime for accurate stops
- Near-miss buzzer for poor accuracy
- Confetti animation for excellent performance

---

## Phase 5: Trade Show Features

### Attract Mode
- Activates after 10-15 seconds of idle
- Auto-demo loop: tank fills, stops near target, shows score
- Pulsing "Tap to Play" call-to-action

### Results Screen
- Shows Accuracy %, Money Kept, Tankers Filled
- "Try again to beat your score" message
- Auto-restart after 8-10 seconds

### Local Leaderboard
- Top 10 scores stored in localStorage
- "Top Scores Today" display
- Hidden admin shortcut (Ctrl+Shift+R) to reset leaderboard

---

## Phase 6: Polish & Trade Show Ready

### Responsive & Touch Support
- Works with mouse and touchscreen
- Fullscreen mode for booth displays
- Large hit targets for all interactive elements

### Offline Capability
- All assets bundled for offline play
- No external API calls during gameplay

### Tunable Constants
- Flow speed per level
- Tolerance zones
- Money scale multipliers
- Timer duration
- All documented in README

---

## Technical Approach
- **React + TypeScript** for game logic
- **Tailwind CSS** for styling
- **Framer Motion** or CSS animations for liquid/tank animations
- **localStorage** for leaderboard persistence
- **No backend required** - fully client-side

