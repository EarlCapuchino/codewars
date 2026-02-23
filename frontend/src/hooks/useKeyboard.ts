'use client';

import { useEffect, useCallback } from 'react';

export function useKeyboard(
  onKeyPress: (key: string) => void,
  enabled: boolean = true
) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onKeyPress(e.key.toLowerCase());
      }
    },
    [onKeyPress, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
