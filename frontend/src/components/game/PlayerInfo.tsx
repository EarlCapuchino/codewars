import React from 'react';
import type { Player } from '@/types/game';

interface PlayerInfoProps {
  players: Player[];
  currentPlayer: Player | null;
}

export default function PlayerInfo({ players, currentPlayer }: PlayerInfoProps) {
  if (players.length <= 1 && currentPlayer) {
    return (
      <div className="text-center font-mono" aria-label="Player status">
        <p className="text-sm text-amber-terminal text-glow-amber">{currentPlayer.name}</p>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className={`attempt-dot ${
                i < currentPlayer.remainingAttempts
                  ? 'attempt-dot--active'
                  : 'attempt-dot--used'
              }`}
              aria-hidden="true"
            />
          ))}
          <span className="ml-2 text-xs text-terminal-muted">
            [{currentPlayer.remainingAttempts}/6 ATTEMPTS]
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label="All players">
      {players.map((player) => {
        const isCurrent = currentPlayer?.id === player.id;
        return (
          <div
            key={player.id}
            className={`
              flex flex-col items-center gap-1 px-3 py-2 border font-mono transition-all
              ${player.eliminated
                ? 'border-error-border bg-error-bg opacity-50'
                : isCurrent
                  ? 'border-terminal-dark bg-terminal-bg'
                  : 'border-crt-border bg-crt-surface'}
            `}
            aria-label={`${player.name}: ${player.remainingAttempts} attempts left${player.eliminated ? ', eliminated' : ''}${isCurrent ? ', current turn' : ''}`}
          >
            <span className={`text-xs font-medium ${isCurrent ? 'text-terminal-green text-glow' : 'text-terminal-muted'}`}>
              {player.name}
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 ${
                    i < player.remainingAttempts ? 'bg-terminal-green' : 'bg-error-red'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            {isCurrent && !player.eliminated && (
              <span className="text-[9px] text-amber-terminal uppercase tracking-widest">
                &gt; ACTIVE
              </span>
            )}
            {player.eliminated && (
              <span className="text-[9px] text-error-red uppercase tracking-widest">
                [DEAD]
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
