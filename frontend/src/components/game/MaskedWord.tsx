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
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4"
      role="status"
      aria-label={`Word: ${maskedWord.replace(/_/g, 'blank')}`}
    >
      {letters.map((ch, i) => (
        <div
          key={`${i}-${ch}`}
          className={`letter-tile ${ch === '_' ? 'letter-tile--blank' : 'letter-tile--revealed'}`}
          aria-label={ch === '_' ? 'blank' : ch}
        >
          {ch === '_' ? '\u00A0' : ch.toUpperCase()}
        </div>
      ))}
    </div>
  );
}
