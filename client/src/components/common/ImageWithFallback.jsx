import React, { useState } from 'react';
import { BookOpen, Image as ImageIcon } from 'lucide-react';

export const ImageWithFallback = ({
  src,
  alt = '',
  className = '',
  fallbackIcon: FallbackIcon = BookOpen,
  fallbackText,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`bg-[#E8F3EF] border border-[#cbe1d7] flex flex-col items-center justify-center text-center p-3 select-none text-[#075E54] ${className}`}
        aria-label={alt || 'Placeholder gambar'}
      >
        <FallbackIcon className="w-8 h-8 text-[#075E54]/70 mb-1" />
        {fallbackText && (
          <span className="text-[11px] font-medium text-[#075E54]/90 line-clamp-2 px-1">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
    />
  );
};
