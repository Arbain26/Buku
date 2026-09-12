import React from 'react';
import { Star } from 'lucide-react';

export const Rating = ({
  value = 5,
  max = 5,
  reviewsCount,
  size = 'sm',
  interactive = false,
  onChange,
  className = '',
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[...Array(max)].map((_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= Math.round(value);

          if (interactive) {
            return (
              <button
                type="button"
                key={i}
                onClick={() => onChange && onChange(starIndex)}
                className="p-0.5 focus:outline-none transition-transform hover:scale-125"
                aria-label={`Beri bintang ${starIndex}`}
              >
                <Star
                  className={`${sizes[size]} ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300 hover:text-amber-300'
                  }`}
                />
              </button>
            );
          }

          return (
            <Star
              key={i}
              className={`${sizes[size]} ${
                isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
              }`}
            />
          );
        })}
      </div>

      {!interactive && (
        <span className={`font-semibold text-[#17211D] ${textSizes[size]}`}>
          {Number(value).toFixed(1)}
        </span>
      )}

      {!interactive && reviewsCount !== undefined && (
        <span className={`text-[#66736D] ${textSizes[size]}`}>
          ({reviewsCount})
        </span>
      )}
    </div>
  );
};
