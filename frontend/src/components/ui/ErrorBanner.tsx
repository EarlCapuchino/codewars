import React from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2 bg-error-bg border border-error-border font-mono text-xs animate-slide-up"
      role="alert"
    >
      <div className="flex items-center gap-2 text-error-red">
        <span className="font-bold">[ERROR]</span>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-error-red hover:text-red-300 transition-colors font-bold px-1"
          aria-label="Dismiss error"
        >
          [X]
        </button>
      )}
    </div>
  );
}
