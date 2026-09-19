import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Mau mencari apa hari ini?',
  size = 'md',
  onClear,
  className = '',
  id = 'search-input',
  autoFocus = false,
  ...props
}) => {
  const handleSubmit = (e) => {
    if (onSubmit) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  const sizeClasses = {
    sm: 'py-1.5 pl-8 pr-7 text-xs',
    md: 'py-2.5 pl-10 pr-9 text-xs sm:text-sm',
    lg: 'py-3.5 pl-12 pr-10 text-sm sm:text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3.5',
    lg: 'w-5 h-5 left-4',
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <Search
        className={`text-gray-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${iconSizes[size]}`}
      />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full bg-white border border-[#E2E8E5] rounded-2xl text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:border-transparent transition-all shadow-xs ${sizeClasses[size]}`}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else if (onChange) onChange('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Hapus pencarian"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
};
