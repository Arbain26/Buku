import React from 'react';
import { MapPin } from 'lucide-react';

export const LocationBadge = ({
  distance,
  district,
  className = '',
  showIcon = true,
  size = 'sm',
}) => {
  let text = '';
  if (distance !== undefined && distance !== null) {
    const formattedDistance = typeof distance === 'number' ? distance.toFixed(1) : distance;
    text = `${formattedDistance} km dari Anda`;
  } else if (district) {
    text = district.includes('Sidrap') ? district : `${district}, Sidrap`;
  } else {
    text = 'Sidrap';
  }

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-xs sm:text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#E8F3EF] text-[#075E54] border border-[#cbe1d7] shrink-0 ${sizes[size]} ${className}`}
    >
      {showIcon && <MapPin className="w-3 h-3 text-[#075E54]" />}
      <span>{text}</span>
    </span>
  );
};
