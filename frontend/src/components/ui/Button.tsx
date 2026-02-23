import React, { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-crt-surface text-terminal-green border-crt-border',
    'hover:bg-crt-lighter hover:text-terminal-bright hover:border-terminal-dark',
    'active:bg-crt-black',
  ].join(' '),
  secondary: [
    'bg-crt-surface text-amber-terminal border-crt-border',
    'hover:bg-crt-lighter hover:text-amber-bright hover:border-amber-dark',
    'active:bg-crt-black',
  ].join(' '),
  danger: [
    'bg-error-bg text-error-red border-error-border',
    'hover:bg-crt-black hover:text-error-red',
    'active:bg-crt-black',
  ].join(' '),
  ghost: [
    'bg-transparent text-terminal-muted border-transparent',
    'hover:text-terminal-dim hover:border-crt-border hover:bg-crt-surface',
  ].join(' '),
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-7 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        font-mono font-medium uppercase tracking-wider
        border transition-all duration-100 select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        boxShadow: disabled || loading
          ? 'none'
          : '1px 1px 0 #00ff4115, -1px -1px 0 #00000060',
      }}
      {...props}
    >
      {loading && (
        <span className="mr-2 animate-blink font-terminal">▓</span>
      )}
      {'>'} {children}
    </button>
  );
}
