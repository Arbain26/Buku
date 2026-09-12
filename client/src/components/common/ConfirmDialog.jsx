import React from 'react';
import { AlertTriangle, Info, CheckCircle2, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  isLoading = false,
}) => {
  const iconConfig = {
    danger: {
      icon: Trash2,
      bg: 'bg-red-50 text-red-600 border-red-100',
      btnVariant: 'danger',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      btnVariant: 'primary',
    },
    primary: {
      icon: CheckCircle2,
      bg: 'bg-[#E8F3EF] text-[#075E54] border-[#cbe1d7]',
      btnVariant: 'primary',
    },
  };

  const currentIcon = iconConfig[variant] || iconConfig.primary;
  const IconComponent = currentIcon.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 py-2">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${currentIcon.bg}`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8E5]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
