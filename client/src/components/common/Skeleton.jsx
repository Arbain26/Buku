import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
      <Skeleton className="w-full h-44 rounded-xl" />
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-1/2 h-4" />
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <Skeleton className="w-1/3 h-4" />
        <Skeleton className="w-1/4 h-7 rounded-lg" />
      </div>
    </div>
  );
};
