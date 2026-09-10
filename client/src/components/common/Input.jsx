import React, { forwardRef } from 'react';

export const Input = forwardRef(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#17211D] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#17211D] placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef(
  ({ label, error, helperText, rows = 4, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#17211D] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#17211D] placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:border-transparent disabled:bg-gray-50 ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export const Select = forwardRef(
  ({ label, error, helperText, children, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#17211D] mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-[#17211D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:border-transparent ${
            error ? 'border-red-400' : 'border-[#E2E8F0]'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
