'use client';

import React, { useEffect } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

export default function Leaderboard() {
  const { state, fetchLeaderboard, clearLeaderboard, newGame } = useGameContext();
  const { leaderboard, loading } = state;

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) return <Loading message="Querying records..." />;

  return (
    <section className="win-window max-w-2xl mx-auto animate-slide-up" aria-label="Leaderboard">
      <div className="win-titlebar">
        <span className="win-titlebar-text">SCOREBOARD.DAT</span>
        <div className="win-titlebar-buttons">
          {leaderboard.length > 0 && (
            <button onClick={clearLeaderboard} className="win-titlebar-btn" title="Clear records">
              DEL
            </button>
          )}
          <button onClick={newGame} className="win-titlebar-btn" title="Close">
            ×
          </button>
        </div>
      </div>

      <div className="win-body">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 font-mono">
            <p className="text-terminal-muted text-sm mb-1">[NO RECORDS FOUND]</p>
            <p className="text-terminal-muted text-xs mb-4">Database is empty.</p>
            <Button onClick={newGame}>Start Playing</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm" aria-label="Leaderboard rankings">
              <thead>
                <tr className="border-b border-crt-border text-xs text-terminal-muted uppercase">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-2">Player</th>
                  <th className="py-2 px-2 text-center">W</th>
                  <th className="py-2 px-2 text-center">L</th>
                  <th className="py-2 px-2 text-center">GP</th>
                  <th className="py-2 px-2 text-center">PTS</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr
                    key={entry.playerName}
                    className="border-b border-crt-border hover:bg-crt-lighter transition-colors"
                  >
                    <td className="py-2 px-2">
                      {i === 0 && <span className="text-amber-terminal font-bold text-glow-amber">01</span>}
                      {i === 1 && <span className="text-terminal-dim">02</span>}
                      {i === 2 && <span className="text-terminal-muted">03</span>}
                      {i > 2 && <span className="text-terminal-muted">{String(i + 1).padStart(2, '0')}</span>}
                    </td>
                    <td className="py-2 px-2 text-terminal-green">
                      {entry.playerName}
                    </td>
                    <td className="py-2 px-2 text-center text-terminal-dim">
                      {entry.wins}
                    </td>
                    <td className="py-2 px-2 text-center text-error-red">
                      {entry.losses}
                    </td>
                    <td className="py-2 px-2 text-center text-terminal-muted">
                      {entry.gamesPlayed}
                    </td>
                    <td className="py-2 px-2 text-center text-amber-terminal font-bold">
                      {entry.totalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="terminal-divider" />

        <div className="text-center">
          <Button variant="ghost" onClick={newGame}>
            Back
          </Button>
        </div>
      </div>
    </section>
  );
}
