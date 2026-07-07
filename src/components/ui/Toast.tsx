import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { classNames } from '@/utils/formatters';
import type { ToastVariant } from '@/types/common';

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS: Record<ToastVariant, string> = {
  success: 'border-gain-500/30 text-gain-400',
  error: 'border-loss-500/30 text-loss-400',
  warning: 'border-warn-500/30 text-warn-500',
  info: 'border-signal-500/30 text-signal-400',
};

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            className={classNames(
              'flex items-start gap-3 rounded-lg border bg-base-800 px-4 py-3 shadow-panel animate-slide-up',
              COLORS[t.variant]
            )}
            role="status"
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-100">{t.title}</p>
              {t.description && <p className="text-xs text-ink-500 mt-0.5">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-ink-700 hover:text-ink-300" aria-label="Dispensar">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
