'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import MaskedWord from './MaskedWord';
import Keyboard from './Keyboard';
import PlayerInfo from './PlayerInfo';
import Button from '@/components/ui/Button';
import ErrorBanner from '@/components/ui/ErrorBanner';

const STRATEGY_LABELS: Record<string, string> = {
  candidate_elimination: 'Scanning word database...',
  word_match: 'Pattern matched — executing',
  word_construction: 'Constructing from fragments...',
  fallback_frequency: 'Frequency analysis mode',
  word_guess_fallback: 'Heuristic guess',
};

export default function AiGameBoard() {
  const { state, requestAiGuess, newGame, setView, dismissError } = useGameContext();
  const { game, lastGuessResult, aiMove, loading, error } = state;
  const [autoPlay, setAutoPlay] = useState(false);

  const isActive = game?.status === 'IN_PROGRESS';

  const correctLetters = useMemo(() => {
    if (!game) return new Set<string>();
    const revealed = game.maskedWord
      .split(' ')
      .filter((ch) => ch !== '_' && ch !== '')
      .map((ch) => ch.toLowerCase());
    return new Set(revealed);
  }, [game]);

  useEffect(() => {
    if (!autoPlay || !isActive || loading) return;
    const timer = setTimeout(() => {
      requestAiGuess();
    }, 1200);
    return () => clearTimeout(timer);
  }, [autoPlay, isActive, loading, requestAiGuess, game]);

  useEffect(() => {
    if (!isActive) setAutoPlay(false);
  }, [isActive]);

  const handleNextMove = useCallback(() => {
    if (!isActive || loading) return;
    requestAiGuess();
  }, [isActive, loading, requestAiGuess]);

  if (!game) return null;

  if (game.status !== 'IN_PROGRESS') {
    const aiWon = game.status === 'WON';
    return (
      <div className="flex flex-col gap-5">
        <MaskedWord maskedWord={game.maskedWord} />

        {aiMove && (
          <div className="text-center text-xs font-mono text-terminal-muted">
            Last strategy: {STRATEGY_LABELS[aiMove.strategy] || aiMove.strategy}
          </div>
        )}

        <div className="win-window text-center animate-bounce-in max-w-md mx-auto" role="alert">
          <div className="win-titlebar">
            <span className="win-titlebar-text">
              {aiWon ? 'AI_VICTORY.LOG' : 'AI_DEFEATED.LOG'}
            </span>
            <div className="win-titlebar-buttons">
              <span className="win-titlebar-btn">×</span>
            </div>
          </div>

          <div className="win-body">
            <div className="font-terminal text-4xl mb-3" aria-hidden="true">
              {aiWon ? (
                <span className="text-terminal-green text-glow">&gt;_ CRACKED</span>
              ) : (
                <span className="text-amber-terminal text-glow-amber">YOU WIN</span>
              )}
            </div>

            <h2 className={`text-xl font-terminal mb-2 tracking-wider ${aiWon ? 'text-terminal-green' : 'text-amber-terminal'}`}>
              {aiWon ? 'AI decoded the target' : 'AI failed to decode'}
            </h2>

            <p className="text-sm font-mono text-terminal-muted mb-1">
              Target: <span className="text-amber-terminal text-glow-amber text-lg">{game.word?.toUpperCase()}</span>
            </p>

            <p className="text-xs font-mono text-terminal-muted mb-5">
              {aiWon
                ? `[${game.players[0]?.remainingAttempts ?? 0} attempt${(game.players[0]?.remainingAttempts ?? 0) !== 1 ? 's' : ''} remaining]`
                : '[All attempts exhausted]'}
            </p>

            <div className="terminal-divider" />

            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={() => setView('ai-setup')} size="lg">
                Retry
              </Button>
              <Button onClick={newGame} variant="secondary" size="lg">
                Main Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {error && <ErrorBanner message={error} onDismiss={dismissError} />}

      <div className="border border-crt-border bg-crt-surface p-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-terminal-muted">TARGET:</span>
          <span className="text-amber-terminal text-glow-amber tracking-[0.25em]">
            {game.word?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono mt-1">
          <span className="text-terminal-muted">MODE:</span>
          <span className="text-terminal-dim">
            {game.category && game.category !== 'all' ? `HINT: ${game.category.toUpperCase()}` : 'NO HINT — FULL SCAN'}
          </span>
        </div>
      </div>

      {lastGuessResult && (
        <div
          className={`text-center text-xs font-mono py-1.5 border ${
            lastGuessResult.correct
              ? 'border-terminal-dark bg-terminal-bg text-terminal-green'
              : 'border-error-border bg-error-bg text-error-red'
          }`}
          role="status"
        >
          AI &gt; &quot;{lastGuessResult.guess.toUpperCase()}&quot; — {lastGuessResult.correct ? '[HIT]' : '[MISS]'}
        </div>
      )}

      {aiMove && (
        <div className="text-center font-mono space-y-0.5">
          <p className="text-xs text-terminal-dim">
            {STRATEGY_LABELS[aiMove.strategy] || aiMove.strategy}
          </p>
          {aiMove.candidatesRemaining > 0 && (
            <p className="text-[10px] text-terminal-muted">
              [{aiMove.candidatesRemaining} candidate{aiMove.candidatesRemaining !== 1 ? 's' : ''} in memory
              {aiMove.confidence > 0 && ` | ${Math.round(aiMove.confidence * 100)}% confidence`}]
            </p>
          )}
          {aiMove.candidatesRemaining === 0 && (
            <p className="text-[10px] text-amber-dim">
              [Word not in database — frequency analysis active]
            </p>
          )}
        </div>
      )}

      <MaskedWord maskedWord={game.maskedWord} />

      <PlayerInfo players={game.players} currentPlayer={game.currentPlayer} />

      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <Button onClick={handleNextMove} disabled={!isActive || loading} loading={loading}>
            Execute
          </Button>
          <Button
            variant={autoPlay ? 'danger' : 'secondary'}
            onClick={() => setAutoPlay(!autoPlay)}
            disabled={!isActive}
          >
            {autoPlay ? 'Halt' : 'Auto-Run'}
          </Button>
        </div>
      </div>

      <Keyboard
        guessedLetters={game.guessedLetters}
        correctLetters={correctLetters}
        onKeyPress={() => {}}
        disabled={true}
      />
    </div>
  );
}
