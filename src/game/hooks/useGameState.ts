import { useState, useCallback, useRef, useEffect } from "react";
import { GameState, GameSession, LoadResult, LevelConfig } from "../types";
import { GAME_CONFIG } from "../constants";

export type Difficulty = "normal" | "fast";

const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  normal: 1,
  fast: 4,
};

const initialSession: GameSession = {
  currentLevel: 0,
  currentCompartment: 0,
  totalCompartmentsInLevel: 1,
  compartmentFillLevels: [0],
  loadResults: [],
  totalMoneyKept: 0,
  totalMoneyLost: 0,
  tankersFilledProgress: 0,
  tankersFilled: 0,
  elapsedTime: 0, // Start at 0, count up
  isComplete: false,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>("attract");
  const [session, setSession] = useState<GameSession>(initialSession);
  const [isFilling, setIsFilling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  
  const fillIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);

  const currentLevelConfig = GAME_CONFIG.LEVELS[session.currentLevel] || GAME_CONFIG.LEVELS[0];
  const currentFillLevel = session.compartmentFillLevels[session.currentCompartment] || 0;
  const speedMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];

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
    const baseFlowRate = currentLevelConfig.flowRate * speedMultiplier;
    const fillPerInterval = (baseFlowRate / 1000) * intervalMs;
    
    fillIntervalRef.current = window.setInterval(() => {
      setSession((prev) => {
        const newLevels = [...prev.compartmentFillLevels];
        const currentLevel = newLevels[prev.currentCompartment] || 0;
        newLevels[prev.currentCompartment] = Math.min(
          currentLevel + fillPerInterval,
          GAME_CONFIG.TANK_CAPACITY * 1.1
        );
        return { ...prev, compartmentFillLevels: newLevels };
      });
    }, intervalMs);
  }, [gameState, showConfirmation, demoMode, currentLevelConfig.flowRate, speedMultiplier]);

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
    
    setSession((prev) => {
      const newLevels = [...prev.compartmentFillLevels];
      const currentLevel = newLevels[prev.currentCompartment] || 0;
      newLevels[prev.currentCompartment] = Math.min(
        currentLevel + GAME_CONFIG.NUDGE_AMOUNT,
        GAME_CONFIG.TANK_CAPACITY * 1.1
      );
      return { ...prev, compartmentFillLevels: newLevels };
    });
  }, [gameState, isFilling, showConfirmation]);

  // Complete current compartment
  const completeLoad = useCallback(() => {
    if (gameState !== "playing") return;
    
    stopFilling();
    
    const result = calculateLoadResult(currentFillLevel, currentLevelConfig.targetFill);
    
    setSession((prev) => {
      const newResults = [...prev.loadResults, result];
      const newTotalMoney = prev.totalMoneyKept + result.moneyKept;
      const newTotalLost = prev.totalMoneyLost + result.moneyLost;
      const newProgress = prev.tankersFilledProgress + result.moneyKept;
      const newTankersFilled = Math.floor(newProgress / GAME_CONFIG.MONEY_PER_TANKER);
      
      const nextCompartment = prev.currentCompartment + 1;
      const isLevelComplete = nextCompartment >= prev.totalCompartmentsInLevel;
      
      // Check if we need confirmation step (only on levels that require it)
      const levelConfig = GAME_CONFIG.LEVELS[prev.currentLevel];
      if ('requiresConfirmation' in levelConfig && levelConfig.requiresConfirmation && !isLevelComplete) {
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
        
        return {
          ...prev,
          currentLevel: nextLevel,
          currentCompartment: 0,
          totalCompartmentsInLevel: nextLevelConfig.compartments,
          compartmentFillLevels: Array(nextLevelConfig.compartments).fill(0),
          loadResults: newResults,
          totalMoneyKept: newTotalMoney,
          totalMoneyLost: newTotalLost,
          tankersFilledProgress: newProgress,
          tankersFilled: newTankersFilled,
        };
      }
      
      // Next compartment in same level
      return {
        ...prev,
        currentCompartment: nextCompartment,
        loadResults: newResults,
        totalMoneyKept: newTotalMoney,
        totalMoneyLost: newTotalLost,
        tankersFilledProgress: newProgress,
        tankersFilled: newTankersFilled,
      };
    });
  }, [gameState, currentFillLevel, currentLevelConfig, calculateLoadResult, stopFilling]);

  // Confirm sample taken
  const confirmSample = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  // Start new game
  const startGame = useCallback((selectedDifficulty: Difficulty = "normal") => {
    setGameState("playing");
    setDemoMode(false);
    setDifficulty(selectedDifficulty);
    
    const firstLevelConfig = GAME_CONFIG.LEVELS[0];
    setSession({
      ...initialSession,
      totalCompartmentsInLevel: firstLevelConfig.compartments,
      compartmentFillLevels: Array(firstLevelConfig.compartments).fill(0),
    });
    setShowConfirmation(false);
    
    // Start game timer (counting UP)
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    timerIntervalRef.current = window.setInterval(() => {
      setSession((prev) => {
        if (prev.isComplete) return prev;
        return { ...prev, elapsedTime: prev.elapsedTime + 1 };
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
    fillLevel: currentFillLevel,
    isFilling,
    showConfirmation,
    demoMode,
    difficulty,
    currentLevelConfig: currentLevelConfig as LevelConfig,
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
  };
}
