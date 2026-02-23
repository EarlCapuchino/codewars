import React, { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            bg-surface-700 border rounded-lg
            px-4 py-2.5 text-gray-200 placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-transparent
            transition-colors
            ${error ? 'border-red-500' : 'border-surface-500'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
