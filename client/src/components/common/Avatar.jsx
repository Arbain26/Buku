import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { resolveImageUrl } from './ImageWithFallback';

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  className = '',
  status,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const getInitials = (n) => {
    if (!n) return '';
    const parts = n.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const resolvedSrc = resolveImageUrl(src);

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {resolvedSrc && !hasError ? (
        <img
          src={resolvedSrc}
          alt={alt || name}
          onError={() => setHasError(true)}
          className={`rounded-full object-cover border border-[#E2E8E5] ${sizes[size]}`}
        />
      ) : (
        <div
          className={`rounded-full bg-[#E8F3EF] text-[#075E54] flex items-center justify-center font-bold border border-[#cbe1d7] select-none ${sizes[size]}`}
        >
          {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white ${
            status === 'active' || status === 'online'
              ? 'bg-emerald-500'
              : status === 'pending'
              ? 'bg-amber-500'
              : 'bg-gray-400'
          } ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'}`}
        />
      )}
    </div>
  );
};
