import React, { type SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
}

export default function Select({ label, options, id, className = '', ...props }: SelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-xs font-mono text-terminal-muted uppercase tracking-wider"
      >
        {'>'} {label}
      </label>
      <select
        id={selectId}
        className={`
          bg-crt-black border border-crt-border font-mono
          px-3 py-2 text-sm text-terminal-green
          focus:outline-none focus:border-terminal-dark
          transition-colors cursor-pointer
          appearance-none
          ${className}
        `}
        style={{
          boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.8), inset -1px -1px 1px rgba(0, 255, 65, 0.03)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%2300cc33' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          paddingRight: '32px',
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
