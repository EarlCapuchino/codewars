'use client';

import React from 'react';
import { GameProvider, useGameContext } from '@/contexts/GameContext';
import Header from '@/components/layout/Header';
import GameSetup from '@/components/game/GameSetup';
import GameBoard from '@/components/game/GameBoard';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import ErrorBanner from '@/components/ui/ErrorBanner';

function AppContent() {
  const { state, dismissError } = useGameContext();

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {state.error && state.view === 'setup' && (
          <div className="mb-6">
            <ErrorBanner message={state.error} onDismiss={dismissError} />
          </div>
        )}

        {state.view === 'setup' && <GameSetup />}
        {state.view === 'game' && <GameBoard />}
        {state.view === 'leaderboard' && <Leaderboard />}
      </main>
      <footer className="text-center text-xs text-gray-600 py-4 border-t border-surface-800">
        CodeWords &copy; {new Date().getFullYear()} &middot; Built with Next.js &amp; Express
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
