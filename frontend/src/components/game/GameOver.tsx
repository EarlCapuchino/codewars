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
    <div className="win-window text-center animate-bounce-in max-w-md mx-auto" role="alert">
      <div className="win-titlebar">
        <span className="win-titlebar-text">
          {won ? 'MISSION_COMPLETE.EXE' : 'GAME_OVER.EXE'}
        </span>
        <div className="win-titlebar-buttons">
          <span className="win-titlebar-btn">×</span>
        </div>
      </div>

      <div className="win-body">
        <div className="font-terminal text-5xl mb-3" aria-hidden="true">
          {won ? (
            <span className="text-terminal-green text-glow">[OK]</span>
          ) : (
            <span className="text-error-red text-glow-red">[FAIL]</span>
          )}
        </div>

        <h2 className={`text-2xl font-terminal mb-2 tracking-wider ${won ? 'text-terminal-green text-glow' : 'text-error-red text-glow-red'}`}>
          {won ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
        </h2>

        {won && game.winner && (
          <p className="text-sm font-mono text-amber-terminal text-glow-amber mb-1">
            {game.winner.name} cracked the code
          </p>
        )}

        {!won && game.word && (
          <p className="text-sm font-mono text-terminal-muted mb-1">
            Target word: <span className="text-amber-terminal text-glow-amber text-lg">{game.word.toUpperCase()}</span>
          </p>
        )}

        <p className="text-xs font-mono text-terminal-muted mb-5 uppercase">
          [{game.category} / {game.difficulty}]
        </p>

        <div className="terminal-divider" />

        <div className="flex gap-2 justify-center mt-4">
          <Button onClick={onNewGame} size="lg">
            Retry
          </Button>
          <Button onClick={onLeaderboard} variant="secondary" size="lg">
            Scores
          </Button>
        </div>
      </div>
    </div>
  );
}
