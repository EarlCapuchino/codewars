import React from 'react';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12" role="status" aria-label={message}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-surface-600" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-green-500 animate-spin" />
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}
