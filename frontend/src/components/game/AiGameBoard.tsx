'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import MaskedWord from './MaskedWord';
import Keyboard from './Keyboard';
import PlayerInfo from './PlayerInfo';
import Button from '@/components/ui/Button';
import ErrorBanner from '@/components/ui/ErrorBanner';

const STRATEGY_LABELS: Record<string, string> = {
  candidate_elimination: 'Analyzing word patterns',
  word_match: 'Found the word!',
  word_construction: 'Constructing word from pattern',
  fallback_frequency: 'Using letter frequency',
  word_guess_fallback: 'Taking a guess',
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
      <div className="flex flex-col gap-6">
        <MaskedWord maskedWord={game.maskedWord} />

        {aiMove && (
          <div className="text-center text-sm text-gray-500">
            Final strategy: {STRATEGY_LABELS[aiMove.strategy] || aiMove.strategy}
          </div>
        )}

        <div className="card text-center animate-bounce-in max-w-md mx-auto" role="alert">
          <div className="text-6xl mb-4" aria-hidden="true">
            {aiWon ? '🤖' : '🎉'}
          </div>

          <h2 className={`text-3xl font-bold mb-2 ${aiWon ? 'text-brand-green-400' : 'text-brand-yellow-400'}`}>
            {aiWon ? 'AI Wins!' : 'You Stumped the AI!'}
          </h2>

          <p className="text-gray-400 mb-1">
            The word was:{' '}
            <span className="font-mono text-brand-yellow-300 font-bold text-lg">
              {game.word?.toUpperCase()}
            </span>
          </p>

          <p className="text-sm text-gray-500 mb-6">
            {aiWon
              ? `The AI guessed it with ${game.players[0]?.remainingAttempts ?? 0} attempt${(game.players[0]?.remainingAttempts ?? 0) !== 1 ? 's' : ''} remaining`
              : 'The AI ran out of attempts'}
          </p>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => setView('ai-setup')} size="lg">
              Play Again
            </Button>
            <Button onClick={newGame} variant="secondary" size="lg">
              Main Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {error && <ErrorBanner message={error} onDismiss={dismissError} />}

      <div className="text-center">
        <p className="text-xs text-gray-500 mb-1">Your secret word</p>
        <p className="font-mono text-lg text-brand-yellow-400 tracking-widest">
          {game.word?.toUpperCase()}
        </p>
      </div>

      <div className="text-center text-xs text-gray-500 capitalize">
        {game.category && game.category !== 'all' ? `Hint: ${game.category} · ` : 'No category hint · '}
        AI Opponent
      </div>

      {lastGuessResult && (
        <div
          className={`text-center text-sm font-medium py-1.5 rounded-lg ${
            lastGuessResult.correct
              ? 'bg-brand-green-900/30 text-brand-green-300'
              : 'bg-red-900/30 text-red-300'
          }`}
          role="status"
        >
          AI guessed &quot;{lastGuessResult.guess.toUpperCase()}&quot; &mdash;{' '}
          {lastGuessResult.correct ? 'Correct!' : 'Wrong!'}
        </div>
      )}

      {aiMove && (
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-400">
            {STRATEGY_LABELS[aiMove.strategy] || aiMove.strategy}
          </p>
          {aiMove.candidatesRemaining > 0 && (
            <p className="text-xs text-gray-600">
              {aiMove.candidatesRemaining} possible word{aiMove.candidatesRemaining !== 1 ? 's' : ''} remaining
              {aiMove.confidence > 0 && ` · ${Math.round(aiMove.confidence * 100)}% confident`}
            </p>
          )}
          {aiMove.candidatesRemaining === 0 && (
            <p className="text-xs text-gray-600">
              Word not in dictionary — using frequency analysis
            </p>
          )}
        </div>
      )}

      <MaskedWord maskedWord={game.maskedWord} />

      <PlayerInfo players={game.players} currentPlayer={game.currentPlayer} />

      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <Button onClick={handleNextMove} disabled={!isActive || loading} loading={loading}>
            Next AI Move
          </Button>
          <Button
            variant={autoPlay ? 'danger' : 'secondary'}
            onClick={() => setAutoPlay(!autoPlay)}
            disabled={!isActive}
          >
            {autoPlay ? 'Stop' : 'Auto Play'}
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
