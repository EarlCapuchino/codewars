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

  if (loadingCategories) return <Loading message="Loading AI subsystem..." />;

  return (
    <section className="win-window max-w-lg mx-auto animate-slide-up" aria-label="AI opponent setup">
      <div className="win-titlebar">
        <span className="win-titlebar-text">AI_CHALLENGE.EXE</span>
        <div className="win-titlebar-buttons">
          <span className="win-titlebar-btn">?</span>
        </div>
      </div>

      <div className="win-body">
        <div className="text-xs font-mono text-terminal-muted mb-1">
          C:\CODEWORDS&gt; <span className="text-terminal-green">load --ai-opponent</span>
        </div>
        <p className="text-xs font-mono text-terminal-muted mb-4">
          Enter a secret word. The AI will attempt to crack it.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Secret Word"
            placeholder="e.g. elephant"
            value={word}
            onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            maxLength={15}
            error={wordError}
            autoComplete="off"
          />

          <label className="flex items-center gap-2 cursor-pointer select-none font-mono text-xs">
            <input
              type="checkbox"
              checked={giveHint}
              onChange={(e) => setGiveHint(e.target.checked)}
              className="w-3.5 h-3.5 bg-crt-black border-crt-border text-terminal-green focus:ring-terminal-dark focus:ring-offset-0 accent-green-600"
            />
            <span className="text-terminal-muted">
              Provide category hint to AI
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

          <p className="text-[10px] font-mono text-terminal-muted text-center uppercase tracking-wider">
            {giveHint
              ? '[MODE: CATEGORY-ASSISTED SEARCH]'
              : '[MODE: FULL DICTIONARY SCAN]'}
          </p>

          <div className="terminal-divider" />

          <div className="flex gap-2">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              loading={state.loading}
              disabled={!isValid}
            >
              Deploy AI
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => setView('setup')}>
              Back
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
