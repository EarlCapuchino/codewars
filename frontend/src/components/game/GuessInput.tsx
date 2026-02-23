'use client';

import React, { useState, useCallback, useRef } from 'react';
import Button from '@/components/ui/Button';

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function GuessInput({ onSubmit, disabled = false, loading = false }: GuessInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) return;
      onSubmit(trimmed);
      setValue('');
      inputRef.current?.focus();
    },
    [value, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^a-zA-Z]/g, ''))}
        placeholder="Guess a letter or word..."
        disabled={disabled}
        maxLength={30}
        className="
          flex-1 bg-surface-700 border border-surface-500 rounded-lg
          px-4 py-2.5 text-gray-200 placeholder-gray-500 font-mono
          focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-transparent
          disabled:opacity-50
        "
        aria-label="Enter your guess"
        autoComplete="off"
      />
      <Button type="submit" disabled={disabled || !value.trim()} loading={loading}>
        Guess
      </Button>
    </form>
  );
}
