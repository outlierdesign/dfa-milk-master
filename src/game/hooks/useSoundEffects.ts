import { useCallback, useEffect, useRef, useState } from "react";

// Singleton AudioContext to avoid creating multiple instances
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Resume audio context on user interaction (required for mobile)
const ensureAudioContextResumed = async () => {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  return ctx;
};

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

// Web Audio API synthetic sound generators
const playTone = async (
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.3
) => {
  try {
    const ctx = await ensureAudioContextResumed();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio playback failed:", e);
  }
};

// Multi-tone for more complex sounds
const playChord = async (frequencies: number[], duration: number, type: OscillatorType = "sine", volume: number = 0.15) => {
  for (const freq of frequencies) {
    playTone(freq, duration, type, volume);
  }
};

// Sweep for whoosh effects
const playSweep = async (startFreq: number, endFreq: number, duration: number, volume: number = 0.3) => {
  try {
    const ctx = await ensureAudioContextResumed();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio sweep failed:", e);
  }
};

// Noise generator for splash/liquid sounds
const playNoise = async (duration: number, volume: number = 0.2) => {
  try {
    const ctx = await ensureAudioContextResumed();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2000;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();
    source.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Noise playback failed:", e);
  }
};

export function useSoundEffects(): SoundEffects {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("game-sound-muted");
    return saved === "true";
  });
  const [volume, setVolumeState] = useState(1);
  
  // Refs for looping sounds
  const fillLoopRef = useRef<{ oscillator: OscillatorNode; gain: GainNode } | null>(null);
  const alarmLoopRef = useRef<{ oscillator: OscillatorNode; gain: GainNode; interval: number } | null>(null);

  // Persist mute state
  useEffect(() => {
    localStorage.setItem("game-sound-muted", String(isMuted));
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)));
  }, []);

  // Sound implementations
  const playGameStart = useCallback(() => {
    if (isMuted) return;
    // Upbeat rising chime
    playChord([523, 659, 784], 0.15, "sine", 0.2 * volume); // C5, E5, G5
    setTimeout(() => playChord([587, 740, 880], 0.2, "sine", 0.25 * volume), 100); // D5, F#5, A5
    setTimeout(() => playChord([659, 830, 988], 0.3, "sine", 0.3 * volume), 200); // E5, G#5, B5
    playSweep(400, 1200, 0.4, 0.15 * volume);
  }, [isMuted, volume]);

  const playButtonClick = useCallback(() => {
    if (isMuted) return;
    // Soft click
    playTone(800, 0.05, "sine", 0.2 * volume);
    playTone(600, 0.03, "sine", 0.15 * volume);
  }, [isMuted, volume]);

  const startFillLoop = useCallback(async () => {
    if (isMuted || fillLoopRef.current) return;
    
    try {
      const ctx = await ensureAudioContextResumed();
      
      // Create a low-tone pump sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      // Deep bass pump tone - sawtooth for mechanical pump feel
      oscillator.type = "sawtooth";
      oscillator.frequency.value = 35; // Very low tone
      
      // LFO creates rhythmic pulsing like a pump
      lfo.type = "sine";
      lfo.frequency.value = 2.5; // Pump rhythm
      lfoGain.gain.value = 12; // Subtle frequency wobble
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      
      // Low-pass filter to smooth the sawtooth
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 150; // Cut high frequencies for deep rumble
      filter.Q.value = 1;
      
      gainNode.gain.value = 0.12 * volume;

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      lfo.start();

      fillLoopRef.current = { oscillator, gain: gainNode };
    } catch (e) {
      console.warn("Fill loop failed:", e);
    }
  }, [isMuted, volume]);

  const stopFillLoop = useCallback(() => {
    if (fillLoopRef.current) {
      try {
        fillLoopRef.current.gain.gain.exponentialRampToValueAtTime(
          0.001,
          getAudioContext().currentTime + 0.1
        );
        setTimeout(() => {
          fillLoopRef.current?.oscillator.stop();
          fillLoopRef.current = null;
        }, 150);
      } catch (e) {
        fillLoopRef.current = null;
      }
    }
    // Play a subtle "stop" sound
    if (!isMuted) {
      playSweep(200, 80, 0.15, 0.1 * volume);
    }
  }, [isMuted, volume]);

  const playNudge = useCallback(() => {
    if (isMuted) return;
    // Quick splash/squirt
    playNoise(0.1, 0.3 * volume);
    playTone(400, 0.08, "sine", 0.2 * volume);
    playSweep(600, 200, 0.1, 0.15 * volume);
  }, [isMuted, volume]);

  const startAlarmLoop = useCallback(async () => {
    if (isMuted || alarmLoopRef.current) return;
    
    try {
      const ctx = await ensureAudioContextResumed();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.1 * volume;

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();

      // Toggle frequency for alarm effect
      const interval = window.setInterval(() => {
        if (oscillator.frequency.value === 880) {
          oscillator.frequency.value = 660;
        } else {
          oscillator.frequency.value = 880;
        }
      }, 200);

      alarmLoopRef.current = { oscillator, gain: gainNode, interval };
    } catch (e) {
      console.warn("Alarm loop failed:", e);
    }
  }, [isMuted, volume]);

  const stopAlarmLoop = useCallback(() => {
    if (alarmLoopRef.current) {
      try {
        clearInterval(alarmLoopRef.current.interval);
        alarmLoopRef.current.gain.gain.exponentialRampToValueAtTime(
          0.001,
          getAudioContext().currentTime + 0.05
        );
        setTimeout(() => {
          alarmLoopRef.current?.oscillator.stop();
          alarmLoopRef.current = null;
        }, 100);
      } catch (e) {
        alarmLoopRef.current = null;
      }
    }
  }, []);

  const playSpill = useCallback(() => {
    if (isMuted) return;
    // Splash sound
    playNoise(0.4, 0.4 * volume);
    playSweep(1000, 100, 0.3, 0.2 * volume);
    // "Cat meow" - descending tone
    setTimeout(() => {
      playSweep(1200, 600, 0.3, 0.25 * volume);
    }, 200);
    setTimeout(() => {
      playSweep(800, 400, 0.25, 0.2 * volume);
    }, 450);
  }, [isMuted, volume]);

  const playComplete = useCallback(() => {
    if (isMuted) return;
    // Truck horn - two low tones
    playTone(220, 0.3, "sawtooth", 0.2 * volume);
    setTimeout(() => playTone(165, 0.4, "sawtooth", 0.25 * volume), 150);
  }, [isMuted, volume]);

  const playSuccess = useCallback(() => {
    if (isMuted) return;
    // Celebratory fanfare
    playChord([523, 659, 784], 0.2, "sine", 0.2 * volume); // C major
    setTimeout(() => playChord([587, 740, 880], 0.2, "sine", 0.2 * volume), 150); // D major
    setTimeout(() => playChord([659, 830, 988], 0.3, "sine", 0.25 * volume), 300); // E major
    setTimeout(() => playChord([784, 988, 1175], 0.4, "sine", 0.3 * volume), 450); // G major
  }, [isMuted, volume]);

  const playFailure = useCallback(() => {
    if (isMuted) return;
    // Subdued descending tone
    playTone(400, 0.3, "sine", 0.2 * volume);
    setTimeout(() => playTone(350, 0.3, "sine", 0.2 * volume), 200);
    setTimeout(() => playTone(300, 0.4, "sine", 0.15 * volume), 400);
  }, [isMuted, volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fillLoopRef.current) {
        fillLoopRef.current.oscillator.stop();
        fillLoopRef.current = null;
      }
      if (alarmLoopRef.current) {
        clearInterval(alarmLoopRef.current.interval);
        alarmLoopRef.current.oscillator.stop();
        alarmLoopRef.current = null;
      }
    };
  }, []);

  return {
    playGameStart,
    playButtonClick,
    startFillLoop,
    stopFillLoop,
    playNudge,
    startAlarmLoop,
    stopAlarmLoop,
    playSpill,
    playComplete,
    playSuccess,
    playFailure,
    setVolume,
    isMuted,
    toggleMute,
  };
}
