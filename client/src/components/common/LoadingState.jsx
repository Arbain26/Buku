import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({
  message = 'Memuat data...',
  description = 'Mohon tunggu sebentar selagi kami menyiapkan informasi untuk Anda.',
  className = '',
}) => {
  return (
    <div
      className={`py-16 px-4 flex flex-col items-center justify-center text-center space-y-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#E8F3EF] flex items-center justify-center text-[#075E54]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <div>
        <h4 className="text-sm sm:text-base font-bold text-[#17211D]">
          {message}
        </h4>
        {description && (
          <p className="text-xs text-[#66736D] mt-0.5 max-w-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
