import React from 'react';
import type { Player } from '@/types/game';

interface PlayerInfoProps {
  players: Player[];
  currentPlayer: Player | null;
}

export default function PlayerInfo({ players, currentPlayer }: PlayerInfoProps) {
  if (players.length <= 1 && currentPlayer) {
    return (
      <div className="text-center" aria-label="Player status">
        <p className="text-lg font-semibold text-brand-yellow-400">{currentPlayer.name}</p>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < currentPlayer.remainingAttempts
                  ? 'bg-brand-green-500'
                  : 'bg-red-500/60'
              }`}
              aria-hidden="true"
            />
          ))}
          <span className="ml-2 text-sm text-gray-400">
            {currentPlayer.remainingAttempts} left
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3" aria-label="All players">
      {players.map((player) => {
        const isCurrent = currentPlayer?.id === player.id;
        return (
          <div
            key={player.id}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-lg border transition-all
              ${player.eliminated
                ? 'border-red-800 bg-red-900/20 opacity-50'
                : isCurrent
                  ? 'border-brand-yellow-400 bg-brand-yellow-500/10 ring-1 ring-brand-yellow-400/40'
                  : 'border-surface-600 bg-surface-700'}
            `}
            aria-label={`${player.name}: ${player.remainingAttempts} attempts left${player.eliminated ? ', eliminated' : ''}${isCurrent ? ', current turn' : ''}`}
          >
            <span className={`text-sm font-semibold ${isCurrent ? 'text-brand-yellow-300' : 'text-gray-300'}`}>
              {player.name}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < player.remainingAttempts ? 'bg-brand-green-500' : 'bg-red-500/60'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            {isCurrent && !player.eliminated && (
              <span className="text-[10px] font-medium text-brand-yellow-400 uppercase tracking-wider">
                Turn
              </span>
            )}
            {player.eliminated && (
              <span className="text-[10px] font-medium text-red-400 uppercase tracking-wider">
                Out
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
