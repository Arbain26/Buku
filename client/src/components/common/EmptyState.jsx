import React from 'react';
import { BookX } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = BookX,
  title = 'Tidak Ada Data',
  description = 'Belum ada konten yang tersedia saat ini.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm my-6">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#075E54] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-[#17211D] mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
