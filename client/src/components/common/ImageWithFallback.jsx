import React, { useState } from 'react';
import { BookOpen, Image as ImageIcon } from 'lucide-react';

export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const backendBase = rawApi.replace(/\/api\/?$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendBase}${cleanPath}`;
  }
  return url;
};

export const ImageWithFallback = ({
  src,
  alt = '',
  className = '',
  fallbackIcon: FallbackIcon = BookOpen,
  fallbackText,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = resolveImageUrl(src);

  if (!resolvedSrc || hasError) {
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
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
    />
  );
};

