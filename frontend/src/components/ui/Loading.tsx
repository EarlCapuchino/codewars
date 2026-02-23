import React from 'react';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 font-mono" role="status" aria-label={message}>
      <div className="text-terminal-green text-2xl font-terminal tracking-widest animate-blink">
        ▓▓▓
      </div>
      <p className="text-terminal-muted text-xs uppercase tracking-wider">
        [{message}]
      </p>
      <div className="text-terminal-dark text-xs">
        <span className="animate-pulse">█</span>
      </div>
    </div>
  );
}
