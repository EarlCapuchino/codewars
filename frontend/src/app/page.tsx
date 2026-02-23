'use client';

import React from 'react';
import { GameProvider, useGameContext } from '@/contexts/GameContext';
import Header from '@/components/layout/Header';
import GameSetup from '@/components/game/GameSetup';
import GameBoard from '@/components/game/GameBoard';
import AiGameSetup from '@/components/game/AiGameSetup';
import AiGameBoard from '@/components/game/AiGameBoard';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import ErrorBanner from '@/components/ui/ErrorBanner';

function AppContent() {
  const { state, dismissError } = useGameContext();

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {state.error && (state.view === 'setup' || state.view === 'ai-setup') && (
          <div className="mb-4">
            <ErrorBanner message={state.error} onDismiss={dismissError} />
          </div>
        )}

        {state.view === 'setup' && <GameSetup />}
        {state.view === 'game' && <GameBoard />}
        {state.view === 'ai-setup' && <AiGameSetup />}
        {state.view === 'ai-game' && <AiGameBoard />}
        {state.view === 'leaderboard' && <Leaderboard />}
      </main>

      <footer className="status-bar">
        <span className="status-bar-section">
          READY
        </span>
        <span className="status-bar-section">
          MODE: {state.view.toUpperCase().replace('-', '_')}
        </span>
        <div className="flex-1" />
        <span className="status-bar-section">
          CODEWORDS &copy; {new Date().getFullYear()}
        </span>
      </footer>
    </>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
