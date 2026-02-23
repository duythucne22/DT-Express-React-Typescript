import React from 'react';
import { cn } from '../../lib/utils/cn';

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}

export default function Modal({ open, title, children, onClose, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close modal backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className={cn('relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200')}>
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>

        <div className="p-5">{children}</div>

        {footer && <div className="px-5 py-4 border-t border-slate-200">{footer}</div>}
      </div>
    </div>
  );
}
