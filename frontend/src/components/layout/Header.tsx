'use client';

import React from 'react';
import { useGameContext } from '@/contexts/GameContext';

export default function Header() {
  const { state, newGame, setView } = useGameContext();

  return (
    <header className="border-b border-crt-border bg-crt-surface sticky top-0 z-50">
      <div className="win-titlebar">
        <button
          onClick={newGame}
          className="flex items-center gap-2 group"
          aria-label="Go to home screen"
        >
          <span className="win-titlebar-text">
            C:\CODEWORDS.EXE
          </span>
        </button>

        <div className="win-titlebar-buttons">
          <span className="win-titlebar-btn" aria-hidden="true">_</span>
          <span className="win-titlebar-btn" aria-hidden="true">□</span>
          <span className="win-titlebar-btn" aria-hidden="true">×</span>
        </div>
      </div>

      <nav
        className="flex items-center gap-1 px-2 py-1 bg-crt-surface border-b border-crt-border text-xs font-mono"
        aria-label="Main navigation"
      >
        <button
          onClick={newGame}
          className="px-2 py-0.5 text-terminal-muted hover:text-terminal-green hover:bg-crt-lighter transition-colors"
        >
          [File]
        </button>
        {state.view === 'game' && (
          <button
            onClick={newGame}
            className="px-2 py-0.5 text-terminal-muted hover:text-terminal-green hover:bg-crt-lighter transition-colors"
          >
            [New Game]
          </button>
        )}
        <button
          onClick={() =>
            state.view === 'leaderboard' ? newGame() : setView('leaderboard')
          }
          className="px-2 py-0.5 text-terminal-muted hover:text-terminal-green hover:bg-crt-lighter transition-colors"
        >
          {state.view === 'leaderboard' ? '[Back]' : '[Scores]'}
        </button>
        <button
          onClick={() => setView('ai-setup')}
          className="px-2 py-0.5 text-terminal-muted hover:text-terminal-green hover:bg-crt-lighter transition-colors"
        >
          [AI Mode]
        </button>

        <div className="flex-1" />

        <span className="text-terminal-muted opacity-60">
          v2.0.0
        </span>
      </nav>
    </header>
  );
}
