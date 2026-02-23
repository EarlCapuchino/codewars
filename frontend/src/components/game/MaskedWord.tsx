import React, { useMemo } from 'react';

interface MaskedWordProps {
  maskedWord: string;
}

export default function MaskedWord({ maskedWord }: MaskedWordProps) {
  const letters = useMemo(
    () => maskedWord.split(' ').filter((ch) => ch !== ''),
    [maskedWord]
  );

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-4"
      role="status"
      aria-label={`Word: ${maskedWord.replace(/_/g, 'blank')}`}
    >
      {letters.map((ch, i) => (
        <div
          key={`${i}-${ch}`}
          className={`letter-tile ${ch === '_' ? 'letter-tile--blank' : 'letter-tile--revealed'}`}
          aria-label={ch === '_' ? 'blank' : ch}
        >
          {ch !== '_' && ch.toUpperCase()}
        </div>
      ))}
    </div>
  );
}
