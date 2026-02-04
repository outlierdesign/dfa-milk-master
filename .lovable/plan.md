

# Adding Sound Effects to Fill The Tank

## Overview

Add immersive audio feedback throughout the game using **pre-recorded sound files** for optimal performance at trade shows. This approach ensures instant playback with no latency or API dependencies.

---

## Sound Effect Inventory

| Sound | Trigger Point | Description |
|-------|--------------|-------------|
| **Game Start** | `AttractModeV2` → "TAP TO PLAY" clicked | Upbeat chime/whoosh |
| **Button Select** | `PreLoadQuestions` → option selected | Soft click/tap |
| **Fill Start** | `GameScreenV2` → `onStartFilling` | Pump motor starts, liquid flow begins |
| **Filling Loop** | While `isFilling === true` | Continuous liquid flow (looping) |
| **Fill Stop** | `GameScreenV2` → `onStopFilling` | Pump stops, flow fades |
| **Nudge** | `GameScreenV2` → `onNudge` clicked | Quick splash/squirt |
| **Overfill Warning** | `spillWarningActive === true` | Alarm beeping (looping) |
| **Spill Trigger** | `SpillMessagePopup` appears | Splash + cat meow |
| **Load Complete** | "DONE - COMPLETE LOAD" clicked | Truck horn or valve closing |
| **Success** | `ResultsScreenV2` with high accuracy | Celebratory fanfare |
| **Poor Result** | `ResultsScreenV2` with low accuracy | Subdued tone |

---

## Implementation Approach

### 1. Create Sound Manager Hook

A centralized `useSoundEffects` hook that:
- Preloads all audio files on component mount
- Provides simple play functions
- Handles looping sounds (fill flow, alarm)
- Includes volume control
- Gracefully handles audio restrictions (mobile autoplay)

```typescript
// src/game/hooks/useSoundEffects.ts
interface SoundEffects {
  playGameStart: () => void;
  playButtonClick: () => void;
  startFillLoop: () => void;
  stopFillLoop: () => void;
  playNudge: () => void;
  startAlarmLoop: () => void;
  stopAlarmLoop: () => void;
  playSpill: () => void;
  playComplete: () => void;
  playSuccess: () => void;
  playFailure: () => void;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}
```

### 2. Add Audio Files

Place royalty-free sound files in `/public/sounds/`:

```
public/sounds/
├── game-start.mp3
├── button-click.mp3
├── fill-loop.mp3
├── fill-stop.mp3
├── nudge.mp3
├── alarm-loop.mp3
├── spill-splash.mp3
├── cat-meow.mp3
├── complete.mp3
├── success.mp3
└── failure.mp3
```

### 3. Integrate into Components

**AttractModeV2.tsx**
```typescript
const { playGameStart } = useSoundEffects();

<button onClick={() => {
  playGameStart();
  onStartGame();
}}>
```

**GameScreenV2.tsx**
```typescript
const { 
  startFillLoop, stopFillLoop, 
  startAlarmLoop, stopAlarmLoop,
  playNudge, playSpill, playComplete 
} = useSoundEffects();

// Start fill loop when filling begins
useEffect(() => {
  if (isFilling && !session.spillAcknowledged) {
    startFillLoop();
  } else {
    stopFillLoop();
  }
}, [isFilling, session.spillAcknowledged]);

// Alarm when overfilling
useEffect(() => {
  if (session.spillWarningActive && isFilling) {
    startAlarmLoop();
  } else {
    stopAlarmLoop();
  }
}, [session.spillWarningActive, isFilling]);
```

**SpillMessagePopup.tsx**
```typescript
// Play spill + cat meow on mount
useEffect(() => {
  playSpill();
}, []);
```

### 4. Volume Control & Mute Toggle

Add a small mute button in the corner of the game screen:
- 🔊 / 🔇 toggle
- Persists preference in localStorage
- Default: sounds ON

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/game/hooks/useSoundEffects.ts` | **NEW** - Sound manager hook |
| `src/game/components/AttractModeV2.tsx` | Add game start sound |
| `src/game/components/PreLoadQuestions.tsx` | Add button click sounds |
| `src/game/components/GameScreenV2.tsx` | Add fill loop, alarm, nudge, complete sounds |
| `src/game/components/SpillMessagePopup.tsx` | Add spill/cat sounds |
| `src/game/components/ResultsScreenV2.tsx` | Add success/failure sounds |
| `src/game/FillTheTank.tsx` | Add SoundProvider and mute toggle UI |
| `public/sounds/*.mp3` | **NEW** - 11 audio files |

---

## Audio Sourcing Options

Since we need royalty-free sounds, I can either:

1. **Use placeholder synthetic sounds** - Generate simple tones/beeps using the Web Audio API as placeholders
2. **Use ElevenLabs integration** - Connect ElevenLabs to generate custom sound effects (requires API key setup)

### Recommendation: Hybrid Approach

For immediate implementation, I'll create the hook infrastructure with **Web Audio API synthetic sounds** as defaults. These provide:
- Zero external dependencies
- Instant playback
- No file hosting needed

You can later replace individual sounds with custom MP3 files by dropping them in `/public/sounds/`.

---

## Technical Details

### Web Audio API Synthetic Sounds

```typescript
// Generate a simple beep
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}
```

### Mobile Audio Handling

Mobile browsers require user interaction before playing audio. The hook will:
1. Create AudioContext on first user tap
2. Resume suspended audio contexts
3. Handle autoplay restrictions gracefully

---

## Summary

| Feature | Implementation |
|---------|---------------|
| Centralized sound system | `useSoundEffects` hook |
| 11 sound trigger points | Across all game screens |
| Looping sounds | Fill flow and alarm |
| Volume control | Mute toggle with localStorage persistence |
| Mobile-friendly | Handles autoplay restrictions |
| Extensible | Easy to swap synthetic sounds for MP3 files |

This creates an engaging audio experience while keeping the implementation simple and trade-show-ready.

