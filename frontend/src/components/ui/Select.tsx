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
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-gray-400"
      >
        {label}
      </label>
      <select
        id={selectId}
        className={`
          bg-surface-700 border border-surface-500 rounded-lg
          px-4 py-2.5 text-gray-200
          focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-transparent
          transition-colors cursor-pointer
          ${className}
        `}
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
