'use client';

import React from 'react';
import { useGameContext } from '@/contexts/GameContext';

export default function Header() {
  const { state, newGame, setView } = useGameContext();

  return (
    <header className="border-b border-surface-700 bg-surface-800/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={newGame}
          className="flex items-center gap-2 group"
          aria-label="Go to home screen"
        >
          <h1 className="font-display text-2xl sm:text-3xl tracking-wide">
            <span className="text-brand-green-400">Code</span>
            <span className="text-brand-yellow-400">Words</span>
          </h1>
        </button>

        <nav className="flex items-center gap-2" aria-label="Main navigation">
          {state.view === 'game' && (
            <button
              onClick={newGame}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 rounded-md hover:bg-surface-600 transition-colors"
            >
              New Game
            </button>
          )}
          <button
            onClick={() =>
              state.view === 'leaderboard' ? newGame() : setView('leaderboard')
            }
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 rounded-md hover:bg-surface-600 transition-colors"
          >
            {state.view === 'leaderboard' ? 'Back' : 'Leaderboard'}
          </button>
        </nav>
      </div>
    </header>
  );
}
