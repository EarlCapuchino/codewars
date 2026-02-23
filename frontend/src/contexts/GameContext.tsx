'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  GameState,
  GameResponse,
  GuessResult,
  CreateGamePayload,
  CreateAiGamePayload,
  AiMove,
  AppView,
  LeaderboardEntry,
} from '@/types/game';
import * as api from '@/services/api';

interface State {
  view: AppView;
  game: GameState | null;
  lastGuessResult: GuessResult | null;
  aiMove: AiMove | null;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GAME'; payload: GameState }
  | { type: 'SET_GUESS_RESULT'; payload: { game: GameState; guessResult: GuessResult } }
  | { type: 'SET_AI_GUESS_RESULT'; payload: { game: GameState; guessResult: GuessResult; aiMove: AiMove } }
  | { type: 'SET_LEADERBOARD'; payload: LeaderboardEntry[] }
  | { type: 'RESET' };

const initialState: State = {
  view: 'setup',
  game: null,
  lastGuessResult: null,
  aiMove: null,
  leaderboard: [],
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_GAME':
      return { ...state, game: action.payload, lastGuessResult: null, aiMove: null, loading: false, error: null };
    case 'SET_GUESS_RESULT':
      return {
        ...state,
        game: action.payload.game,
        lastGuessResult: action.payload.guessResult,
        loading: false,
        error: null,
      };
    case 'SET_AI_GUESS_RESULT':
      return {
        ...state,
        game: action.payload.game,
        lastGuessResult: action.payload.guessResult,
        aiMove: action.payload.aiMove,
        loading: false,
        error: null,
      };
    case 'SET_LEADERBOARD':
      return { ...state, leaderboard: action.payload, loading: false };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface GameContextType {
  state: State;
  startGame: (payload: CreateGamePayload) => Promise<void>;
  submitGuess: (guess: string) => Promise<void>;
  startAiGame: (payload: CreateAiGamePayload) => Promise<void>;
  requestAiGuess: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  clearLeaderboard: () => Promise<void>;
  setView: (view: AppView) => void;
  newGame: () => void;
  dismissError: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startGame = useCallback(async (payload: CreateGamePayload) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const game = await api.createGame(payload);
      dispatch({ type: 'SET_GAME', payload: game });
      dispatch({ type: 'SET_VIEW', payload: 'game' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to start game' });
    }
  }, []);

  const submitGuess = useCallback(async (guess: string) => {
    if (!state.game) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response: GameResponse = await api.makeGuess(state.game.id, {
        guess,
        playerId: state.game.currentPlayer?.id,
      });
      const { guessResult, ...gameState } = response;
      dispatch({
        type: 'SET_GUESS_RESULT',
        payload: {
          game: gameState,
          guessResult: guessResult || { guess, correct: false, alreadyGuessed: false },
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit guess';
      if (msg.toLowerCase().includes('not found')) {
        dispatch({ type: 'RESET' });
        dispatch({ type: 'SET_ERROR', payload: 'Game session expired. Please start a new game.' });
        return;
      }
      dispatch({ type: 'SET_ERROR', payload: msg });
    }
  }, [state.game]);

  const startAiGame = useCallback(async (payload: CreateAiGamePayload) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const game = await api.createAiGame(payload);
      dispatch({ type: 'SET_GAME', payload: game });
      dispatch({ type: 'SET_VIEW', payload: 'ai-game' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to start AI game' });
    }
  }, []);

  const requestAiGuess = useCallback(async () => {
    if (!state.game) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await api.requestAiGuess(state.game.id);
      const { guessResult, aiMove, ...gameState } = response;
      dispatch({
        type: 'SET_AI_GUESS_RESULT',
        payload: {
          game: gameState as GameState,
          guessResult: guessResult || { guess: aiMove.guess, correct: false, alreadyGuessed: false },
          aiMove,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI guess failed';
      if (msg.toLowerCase().includes('not found')) {
        dispatch({ type: 'RESET' });
        dispatch({ type: 'SET_ERROR', payload: 'Game session expired. Please start a new game.' });
        return;
      }
      dispatch({ type: 'SET_ERROR', payload: msg });
    }
  }, [state.game]);

  const fetchLeaderboard = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await api.getLeaderboard();
      dispatch({ type: 'SET_LEADERBOARD', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to fetch leaderboard' });
    }
  }, []);

  const clearLeaderboard = useCallback(async () => {
    try {
      await api.resetLeaderboard();
      dispatch({ type: 'SET_LEADERBOARD', payload: [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to clear leaderboard' });
    }
  }, []);

  const setView = useCallback((view: AppView) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const newGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const dismissError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value = useMemo(
    () => ({
      state,
      startGame,
      submitGuess,
      startAiGame,
      requestAiGuess,
      fetchLeaderboard,
      clearLeaderboard,
      setView,
      newGame,
      dismissError,
    }),
    [state, startGame, submitGuess, startAiGame, requestAiGuess, fetchLeaderboard, clearLeaderboard, setView, newGame, dismissError]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameProvider');
  return ctx;
}
