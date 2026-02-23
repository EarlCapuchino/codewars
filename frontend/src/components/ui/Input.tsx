import React, { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-mono text-terminal-muted uppercase tracking-wider">
            {'>'} {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            bg-crt-black border font-mono
            px-3 py-2 text-sm text-terminal-green placeholder-terminal-muted
            focus:outline-none focus:border-terminal-dark focus:text-terminal-bright
            transition-colors caret-terminal-green
            ${error ? 'border-error-border' : 'border-crt-border'}
            ${className}
          `}
          style={{
            boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.8), inset -1px -1px 1px rgba(0, 255, 65, 0.03)',
          }}
          {...props}
        />
        {error && (
          <p className="text-xs font-mono text-error-red" role="alert">
            [ERROR] {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
