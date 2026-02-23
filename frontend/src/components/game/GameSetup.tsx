'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { useGameContext } from '@/contexts/GameContext';
import type { Difficulty, Category } from '@/types/game';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy (shorter words)' },
  { value: 'average', label: 'Average' },
  { value: 'hard', label: 'Hard (longer words)' },
];

const CATEGORY_OPTIONS = [
  { value: 'animals', label: 'Animals' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'food', label: 'Food' },
];

const PLAYER_COUNT_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} Player${i > 0 ? 's' : ''}`,
}));

export default function GameSetup() {
  const { startGame, setView, state } = useGameContext();
  const [playerCount, setPlayerCount] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('average');
  const [category, setCategory] = useState<Category>('animals');
  const [playerNames, setPlayerNames] = useState<string[]>(['']);

  const handlePlayerCountChange = useCallback((count: number) => {
    setPlayerCount(count);
    setPlayerNames((prev) => {
      const next = [...prev];
      while (next.length < count) next.push('');
      return next.slice(0, count);
    });
  }, []);

  const handleNameChange = useCallback((index: number, name: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const names = playerNames.map((n, i) => n.trim() || `Player ${i + 1}`);
      startGame({ playerCount, difficulty, category, players: names });
    },
    [playerNames, playerCount, difficulty, category, startGame]
  );

  const wordLengthHint = useMemo(() => {
    const base = { easy: 4, average: 6, hard: 8 }[difficulty];
    return base + (playerCount - 1);
  }, [difficulty, playerCount]);

  return (
    <section className="card max-w-lg mx-auto animate-slide-up" aria-label="Game setup">
      <h2 className="text-2xl font-bold text-center mb-6 text-brand-green-400">New Game</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Select
          label="Number of Players"
          options={PLAYER_COUNT_OPTIONS}
          value={String(playerCount)}
          onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
        />

        <Select
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
        />

        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        />

        <p className="text-xs text-gray-500 text-center">
          Target word length: ~{wordLengthHint} letters
        </p>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-gray-400 mb-2">Player Names</legend>
          {Array.from({ length: playerCount }, (_, i) => (
            <Input
              key={i}
              placeholder={`Player ${i + 1}`}
              value={playerNames[i] || ''}
              onChange={(e) => handleNameChange(i, e.target.value)}
              maxLength={20}
              aria-label={`Name for player ${i + 1}`}
            />
          ))}
        </fieldset>

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" className="flex-1" loading={state.loading}>
            Start Game
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => setView('leaderboard')}>
            Leaderboard
          </Button>
        </div>
      </form>
    </section>
  );
}
