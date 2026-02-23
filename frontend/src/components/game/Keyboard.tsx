'use client';

import React, { useCallback, useMemo } from 'react';

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

interface KeyboardProps {
  guessedLetters: string[];
  correctLetters: Set<string>;
  onKeyPress: (key: string) => void;
  disabled?: boolean;
}

export default function Keyboard({
  guessedLetters,
  correctLetters,
  onKeyPress,
  disabled = false,
}: KeyboardProps) {
  const guessedSet = useMemo(() => new Set(guessedLetters), [guessedLetters]);

  const getKeyClass = useCallback(
    (key: string) => {
      if (!guessedSet.has(key)) return 'keyboard-key--default';
      if (correctLetters.has(key)) return 'keyboard-key--correct';
      return 'keyboard-key--wrong';
    },
    [guessedSet, correctLetters]
  );

  return (
    <div
      className="flex flex-col items-center gap-1 p-3 border border-crt-border bg-crt-surface"
      role="group"
      aria-label="Virtual keyboard"
    >
      <div className="text-[10px] font-mono text-terminal-muted uppercase tracking-wider mb-1">
        Input Terminal
      </div>
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1 sm:gap-1.5">
          {row.map((key) => {
            const isGuessed = guessedSet.has(key);
            return (
              <button
                key={key}
                type="button"
                className={`keyboard-key ${getKeyClass(key)} ${disabled || isGuessed ? 'keyboard-key--disabled' : ''}`}
                onClick={() => onKeyPress(key)}
                disabled={disabled || isGuessed}
                aria-label={`${key}${isGuessed ? (correctLetters.has(key) ? ' (correct)' : ' (incorrect)') : ''}`}
              >
                {key.toUpperCase()}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
