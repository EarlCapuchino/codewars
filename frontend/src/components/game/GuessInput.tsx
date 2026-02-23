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
      <div className="flex-1 flex items-center bg-crt-black border border-crt-border">
        <span className="text-terminal-muted text-xs font-mono pl-2 select-none">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^a-zA-Z]/g, ''))}
          placeholder="guess..."
          disabled={disabled}
          maxLength={30}
          className="
            flex-1 bg-transparent font-mono
            px-2 py-2 text-sm text-terminal-green placeholder-terminal-muted
            focus:outline-none
            disabled:opacity-40 caret-terminal-green
          "
          aria-label="Enter your guess"
          autoComplete="off"
        />
      </div>
      <Button type="submit" disabled={disabled || !value.trim()} loading={loading}>
        Enter
      </Button>
    </form>
  );
}
