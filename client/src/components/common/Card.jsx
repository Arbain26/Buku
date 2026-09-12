import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-5 sm:p-6',
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E2E8E5] transition-all duration-200 ${
        hover ? 'hover:shadow-md hover:border-[#075E54]/30 hover:-translate-y-0.5 cursor-pointer' : 'shadow-xs'
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-[#E2E8E5] pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base sm:text-lg font-bold text-[#17211D] ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs text-[#66736D] mt-0.5 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-[#E2E8E5] pt-4 mt-4 flex items-center justify-between ${className}`}>
    {children}
  </div>
);
