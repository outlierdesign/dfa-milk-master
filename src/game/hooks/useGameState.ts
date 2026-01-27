import { useState, useCallback, useRef, useEffect } from "react";
import { GameState, GameSession, LoadResult, LevelConfig } from "../types";
import { GAME_CONFIG } from "../constants";

const initialSession: GameSession = {
  currentLevel: 0,
  currentTrailer: 0,
  totalTrailersInLevel: 1,
  loadResults: [],
  totalMoneyKept: 0,
  totalMoneyLost: 0,
  tankersFilledProgress: 0,
  tankersFilled: 0,
  timeRemaining: GAME_CONFIG.ROUND_DURATION,
  isComplete: false,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>("attract");
  const [session, setSession] = useState<GameSession>(initialSession);
  const [fillLevel, setFillLevel] = useState(0);
  const [isFilling, setIsFilling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  const fillIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);

  const currentLevelConfig: LevelConfig = GAME_CONFIG.LEVELS[session.currentLevel] || GAME_CONFIG.LEVELS[0];

  // Calculate accuracy and money
  const calculateLoadResult = useCallback((actualFill: number, targetFill: number): LoadResult => {
    const difference = Math.abs(actualFill - targetFill);
    const maxDifference = GAME_CONFIG.TANK_CAPACITY;
    const accuracy = Math.max(0, 100 - (difference / maxDifference) * 100);
    const moneyKept = Math.round((accuracy / 100) * GAME_CONFIG.BASE_MONEY_PER_LOAD);
    const moneyLost = GAME_CONFIG.BASE_MONEY_PER_LOAD - moneyKept;

    return {
      targetFill,
      actualFill,
      accuracy: Math.round(accuracy * 10) / 10,
      moneyKept,
      moneyLost,
    };
  }, []);

  // Start filling
  const startFilling = useCallback(() => {
    if (gameState !== "playing" || showConfirmation || demoMode) return;
    
    setIsFilling(true);
    
    if (fillIntervalRef.current) {
      clearInterval(fillIntervalRef.current);
    }
    
    const intervalMs = 16; // ~60fps
    const fillPerInterval = (currentLevelConfig.flowRate / 1000) * intervalMs;
    
    fillIntervalRef.current = window.setInterval(() => {
      setFillLevel((prev) => {
        const newLevel = prev + fillPerInterval;
        // Allow slight overfill for realism
        return Math.min(newLevel, GAME_CONFIG.TANK_CAPACITY * 1.1);
      });
    }, intervalMs);
  }, [gameState, showConfirmation, demoMode, currentLevelConfig.flowRate]);

  // Stop filling
  const stopFilling = useCallback(() => {
    setIsFilling(false);
    
    if (fillIntervalRef.current) {
      clearInterval(fillIntervalRef.current);
      fillIntervalRef.current = null;
    }
  }, []);

  // Nudge fill level
  const nudgeFill = useCallback(() => {
    if (gameState !== "playing" || isFilling || showConfirmation) return;
    
    setFillLevel((prev) => Math.min(prev + GAME_CONFIG.NUDGE_AMOUNT, GAME_CONFIG.TANK_CAPACITY * 1.1));
  }, [gameState, isFilling, showConfirmation]);

  // Complete current load
  const completeLoad = useCallback(() => {
    if (gameState !== "playing") return;
    
    stopFilling();
    
    const result = calculateLoadResult(fillLevel, currentLevelConfig.targetFill);
    
    setSession((prev) => {
      const newResults = [...prev.loadResults, result];
      const newTotalMoney = prev.totalMoneyKept + result.moneyKept;
      const newTotalLost = prev.totalMoneyLost + result.moneyLost;
      const newProgress = prev.tankersFilledProgress + result.moneyKept;
      const newTankersFilled = Math.floor(newProgress / GAME_CONFIG.MONEY_PER_TANKER);
      
      const nextTrailer = prev.currentTrailer + 1;
      const isLevelComplete = nextTrailer >= prev.totalTrailersInLevel;
      
      // Check if we need confirmation step
      if (currentLevelConfig.requiresConfirmation && !isLevelComplete) {
        setShowConfirmation(true);
      }
      
      if (isLevelComplete) {
        // Move to next level
        const nextLevel = prev.currentLevel + 1;
        
        if (nextLevel >= GAME_CONFIG.LEVELS.length) {
          // Game complete
          return {
            ...prev,
            loadResults: newResults,
            totalMoneyKept: newTotalMoney,
            totalMoneyLost: newTotalLost,
            tankersFilledProgress: newProgress,
            tankersFilled: newTankersFilled,
            isComplete: true,
          };
        }
        
        const nextLevelConfig = GAME_CONFIG.LEVELS[nextLevel];
        setFillLevel(0);
        
        return {
          ...prev,
          currentLevel: nextLevel,
          currentTrailer: 0,
          totalTrailersInLevel: nextLevelConfig.trailers,
          loadResults: newResults,
          totalMoneyKept: newTotalMoney,
          totalMoneyLost: newTotalLost,
          tankersFilledProgress: newProgress,
          tankersFilled: newTankersFilled,
        };
      }
      
      // Next trailer in same level
      setFillLevel(0);
      
      return {
        ...prev,
        currentTrailer: nextTrailer,
        loadResults: newResults,
        totalMoneyKept: newTotalMoney,
        totalMoneyLost: newTotalLost,
        tankersFilledProgress: newProgress,
        tankersFilled: newTankersFilled,
      };
    });
  }, [gameState, fillLevel, currentLevelConfig, calculateLoadResult, stopFilling]);

  // Confirm sample taken
  const confirmSample = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  // Start new game
  const startGame = useCallback(() => {
    setGameState("playing");
    setDemoMode(false);
    setSession({
      ...initialSession,
      totalTrailersInLevel: GAME_CONFIG.LEVELS[0].trailers,
    });
    setFillLevel(0);
    setShowConfirmation(false);
    
    // Start game timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    timerIntervalRef.current = window.setInterval(() => {
      setSession((prev) => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          return { ...prev, timeRemaining: 0, isComplete: true };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);
  }, []);

  // End game and show results
  const endGame = useCallback(() => {
    stopFilling();
    setGameState("results");
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [stopFilling]);

  // Reset to attract mode
  const resetToAttract = useCallback(() => {
    stopFilling();
    setGameState("attract");
    setSession(initialSession);
    setFillLevel(0);
    setShowConfirmation(false);
    setDemoMode(false);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [stopFilling]);

  // Watch for game completion
  useEffect(() => {
    if (session.isComplete && gameState === "playing") {
      endGame();
    }
  }, [session.isComplete, gameState, endGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fillIntervalRef.current) clearInterval(fillIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  // Calculate average accuracy
  const averageAccuracy = session.loadResults.length > 0
    ? session.loadResults.reduce((sum, r) => sum + r.accuracy, 0) / session.loadResults.length
    : 0;

  return {
    gameState,
    session,
    fillLevel,
    isFilling,
    showConfirmation,
    demoMode,
    currentLevelConfig,
    averageAccuracy,
    startFilling,
    stopFilling,
    nudgeFill,
    completeLoad,
    confirmSample,
    startGame,
    endGame,
    resetToAttract,
    setDemoMode,
    setFillLevel,
  };
}
