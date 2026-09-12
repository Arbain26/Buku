import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Terjadi kesalahan',
  message = 'Data belum dapat dimuat saat ini. Silakan periksa koneksi dan coba lagi.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`py-16 px-4 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto ${className}`}
      role="alert"
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-xs">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-[#17211D]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="border-[#E2E8E5] hover:border-[#075E54] text-[#075E54] gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Coba Lagi</span>
        </Button>
      )}
    </div>
  );
};
