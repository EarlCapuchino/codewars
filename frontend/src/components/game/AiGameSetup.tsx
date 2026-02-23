'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import { useGameContext } from '@/contexts/GameContext';
import { getCategories } from '@/services/api';
import type { CategoryInfo } from '@/types/game';

export default function AiGameSetup() {
  const { startAiGame, setView, state } = useGameContext();
  const [word, setWord] = useState('');
  const [giveHint, setGiveHint] = useState(false);
  const [category, setCategory] = useState('animals');
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingCategories(true);
    getCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(data);
          if (data.length > 0) setCategory(data[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setCategories([{ id: 'animals', label: 'Animals' }]);
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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = word.trim().toLowerCase();
      if (!trimmed || trimmed.length < 3) return;
      startAiGame({
        word: trimmed,
        category: giveHint ? category : undefined,
      });
    },
    [word, giveHint, category, startAiGame]
  );

  const wordError = useMemo(() => {
    const trimmed = word.trim();
    if (!trimmed) return undefined;
    if (!/^[a-zA-Z]+$/.test(trimmed)) return 'Only letters allowed';
    if (trimmed.length < 3) return 'At least 3 letters';
    if (trimmed.length > 15) return 'Maximum 15 letters';
    return undefined;
  }, [word]);

  const isValid = word.trim().length >= 3 && !wordError;

  if (loadingCategories) return <Loading message="Loading..." />;

  return (
    <section className="card max-w-lg mx-auto animate-slide-up" aria-label="AI opponent setup">
      <h2 className="text-2xl font-bold text-center mb-2 text-brand-green-400">
        Challenge the AI
      </h2>
      <p className="text-center text-gray-400 text-sm mb-6">
        Pick a secret word and watch the AI try to guess it
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Your Secret Word"
          placeholder="e.g. elephant"
          value={word}
          onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z]/g, ''))}
          maxLength={15}
          error={wordError}
          autoComplete="off"
        />

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={giveHint}
            onChange={(e) => setGiveHint(e.target.checked)}
            className="w-4 h-4 rounded border-surface-500 bg-surface-700 text-brand-green-500 focus:ring-brand-green-500 focus:ring-offset-0"
          />
          <span className="text-sm text-gray-400">
            Give the AI a category hint
          </span>
        </label>

        {giveHint && (
          <Select
            label="Category Hint"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        )}

        <p className="text-xs text-gray-600 text-center">
          {giveHint
            ? 'The AI will narrow its search to this category'
            : 'The AI will search across all categories — harder to guess!'}
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            loading={state.loading}
            disabled={!isValid}
          >
            Start Challenge
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => setView('setup')}>
            Back
          </Button>
        </div>
      </form>
    </section>
  );
}
