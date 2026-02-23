import React from 'react';
import type { GameState } from '@/types/game';
import Button from '@/components/ui/Button';

interface GameOverProps {
  game: GameState;
  onNewGame: () => void;
  onLeaderboard: () => void;
}

export default function GameOver({ game, onNewGame, onLeaderboard }: GameOverProps) {
  const won = game.status === 'WON';

  return (
    <div className="card text-center animate-bounce-in max-w-md mx-auto" role="alert">
      <div className="text-6xl mb-4" aria-hidden="true">
        {won ? '🎉' : '😔'}
      </div>

      <h2 className={`text-3xl font-bold mb-2 ${won ? 'text-brand-green-400' : 'text-red-400'}`}>
        {won ? 'Victory!' : 'Game Over'}
      </h2>

      {won && game.winner && (
        <p className="text-lg text-brand-yellow-400 font-semibold mb-1">
          {game.winner.name} guessed the word!
        </p>
      )}

      {!won && game.word && (
        <p className="text-gray-400 mb-1">
          The word was: <span className="font-mono text-brand-yellow-300 font-bold text-lg">{game.word.toUpperCase()}</span>
        </p>
      )}

      <p className="text-sm text-gray-500 mb-6 capitalize">
        {game.category} &middot; {game.difficulty}
      </p>

      <div className="flex gap-3 justify-center">
        <Button onClick={onNewGame} size="lg">
          Play Again
        </Button>
        <Button onClick={onLeaderboard} variant="secondary" size="lg">
          Leaderboard
        </Button>
      </div>
    </div>
  );
}
