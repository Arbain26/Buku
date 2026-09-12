import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  id,
  options = [],
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#17211D]"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full appearance-none px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border text-[#17211D] pr-9 transition-all focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error
              ? 'border-red-400 focus:ring-red-500'
              : 'border-[#E2E8E5] hover:border-gray-400'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#66736D]">{helperText}</p>
      ) : null}
    </div>
  );
};
