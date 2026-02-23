'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { useGameContext } from '@/contexts/GameContext';
import { getCategories } from '@/services/api';
import type { Difficulty, CategoryInfo } from '@/types/game';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy (shorter words)' },
  { value: 'average', label: 'Average' },
  { value: 'hard', label: 'Hard (longer words)' },
];

const PLAYER_COUNT_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} Player${i > 0 ? 's' : ''}`,
}));

export default function GameSetup() {
  const { startGame, setView, state } = useGameContext();
  const [playerCount, setPlayerCount] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('average');
  const [category, setCategory] = useState('animals');
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingCategories(true);
    getCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
          if (data.length > 0 && !data.find((c) => c.id === category)) {
            setCategory(data[0].id);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([{ id: 'animals', label: 'Animals' }]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });
    return () => { cancelled = true; };
  }, []);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.label })),
    [categories]
  );

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

  if (loadingCategories) {
    return <Loading message="Loading categories..." />;
  }

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
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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

        <div className="relative flex items-center gap-3 pt-2">
          <div className="flex-1 border-t border-surface-600" />
          <span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-surface-600" />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => setView('ai-setup')}
        >
          Challenge the AI
        </Button>
      </form>
    </section>
  );
}
