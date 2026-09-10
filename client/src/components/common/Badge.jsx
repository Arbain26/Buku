import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // default, green, amber, red, blue, purple
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    primary: 'bg-[#075E54]/10 text-[#075E54] border-[#075E54]/20',
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
