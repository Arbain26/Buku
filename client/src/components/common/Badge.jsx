import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // default, green, amber, red, blue, purple
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    green: 'bg-[#E8F3EF] text-[#075E54] border-[#cbe1d7]',
    primary: 'bg-[#075E54] text-white border-[#075E54]',
    soft: 'bg-[#E8F3EF] text-[#075E54] border-[#cbe1d7]',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
};
