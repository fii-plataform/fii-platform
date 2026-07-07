import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { classNames } from '@/utils/formatters';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClass?: string;
}

export function Modal({ open, onClose, title, children, widthClass = 'max-w-lg' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={classNames(
          'relative w-full rounded-xl border border-base-600 bg-base-800 shadow-panel animate-slide-up max-h-[85vh] overflow-y-auto',
          widthClass
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-600 sticky top-0 bg-base-800">
          <h2 className="font-display text-base font-semibold text-ink-100">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-ink-500 hover:bg-base-700 hover:text-ink-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
