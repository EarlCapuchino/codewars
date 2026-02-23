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

  if (loading) return <Loading message="Loading leaderboard..." />;

  return (
    <section className="card max-w-2xl mx-auto animate-slide-up" aria-label="Leaderboard">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-brand-yellow-400">Leaderboard</h2>
        {leaderboard.length > 0 && (
          <Button variant="danger" size="sm" onClick={clearLeaderboard}>
            Reset
          </Button>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No games played yet.</p>
          <Button onClick={newGame}>Start Playing</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Leaderboard rankings">
            <thead>
              <tr className="border-b border-surface-600 text-sm text-gray-400">
                <th className="py-3 px-2 w-10">#</th>
                <th className="py-3 px-2">Player</th>
                <th className="py-3 px-2 text-center">Wins</th>
                <th className="py-3 px-2 text-center">Losses</th>
                <th className="py-3 px-2 text-center">Games</th>
                <th className="py-3 px-2 text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr
                  key={entry.playerName}
                  className="border-b border-surface-700 hover:bg-surface-700/50 transition-colors"
                >
                  <td className="py-3 px-2">
                    {i === 0 && <span className="text-brand-yellow-400 font-bold">1st</span>}
                    {i === 1 && <span className="text-gray-300 font-bold">2nd</span>}
                    {i === 2 && <span className="text-orange-400 font-bold">3rd</span>}
                    {i > 2 && <span className="text-gray-500">{i + 1}</span>}
                  </td>
                  <td className="py-3 px-2 font-semibold text-gray-200">
                    {entry.playerName}
                  </td>
                  <td className="py-3 px-2 text-center text-brand-green-400 font-semibold">
                    {entry.wins}
                  </td>
                  <td className="py-3 px-2 text-center text-red-400">
                    {entry.losses}
                  </td>
                  <td className="py-3 px-2 text-center text-gray-400">
                    {entry.gamesPlayed}
                  </td>
                  <td className="py-3 px-2 text-center text-brand-yellow-400 font-semibold">
                    {entry.totalScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={newGame}>
          Back to Setup
        </Button>
      </div>
    </section>
  );
}
