'use client';

import React, { useCallback, useMemo } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { useKeyboard } from '@/hooks/useKeyboard';
import MaskedWord from './MaskedWord';
import Keyboard from './Keyboard';
import GuessInput from './GuessInput';
import PlayerInfo from './PlayerInfo';
import GameOver from './GameOver';
import ErrorBanner from '@/components/ui/ErrorBanner';

export default function GameBoard() {
  const { state, submitGuess, newGame, setView, dismissError } = useGameContext();
  const { game, lastGuessResult, loading, error } = state;

  const isActive = game?.status === 'IN_PROGRESS';

  const correctLetters = useMemo(() => {
    if (!game) return new Set<string>();
    const revealed = game.maskedWord
      .split(' ')
      .filter((ch) => ch !== '_' && ch !== '')
      .map((ch) => ch.toLowerCase());
    return new Set(revealed);
  }, [game]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!isActive || loading) return;
      submitGuess(key);
    },
    [isActive, loading, submitGuess]
  );

  useKeyboard(handleKeyPress, isActive && !loading);

  if (!game) return null;

  if (game.status !== 'IN_PROGRESS') {
    return (
      <div className="flex flex-col gap-5">
        <MaskedWord maskedWord={game.maskedWord} />
        <GameOver game={game} onNewGame={newGame} onLeaderboard={() => { setView('leaderboard'); }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {error && <ErrorBanner message={error} onDismiss={dismissError} />}

      {lastGuessResult && (
        <div
          className={`text-center text-xs font-mono py-1.5 border ${
            lastGuessResult.correct
              ? 'border-terminal-dark bg-terminal-bg text-terminal-green'
              : 'border-error-border bg-error-bg text-error-red'
          }`}
          role="status"
        >
          {lastGuessResult.correct
            ? `[OK] "${lastGuessResult.guess.toUpperCase()}" found in target`
            : `[MISS] "${lastGuessResult.guess.toUpperCase()}" not in target`}
        </div>
      )}

      <div className="text-center text-xs font-mono text-terminal-muted uppercase tracking-wider">
        [{game.category} / {game.difficulty}]
      </div>

      <MaskedWord maskedWord={game.maskedWord} />

      <PlayerInfo players={game.players} currentPlayer={game.currentPlayer} />

      <GuessInput onSubmit={submitGuess} disabled={!isActive || loading} loading={loading} />

      <Keyboard
        guessedLetters={game.guessedLetters}
        correctLetters={correctLetters}
        onKeyPress={handleKeyPress}
        disabled={!isActive || loading}
      />
    </div>
  );
}
