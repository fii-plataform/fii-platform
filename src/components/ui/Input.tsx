import type { InputHTMLAttributes, LabelHTMLAttributes } from 'react';
import { classNames } from '@/utils/formatters';

export function Label({ className, children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={classNames('block text-xs font-medium text-ink-500 mb-1.5', className)} {...rest}>
      {children}
    </label>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={classNames(
        'w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700',
        'focus:border-signal-500 focus:ring-1 focus:ring-signal-500 outline-none transition-colors',
        className
      )}
      {...rest}
    />
  );
}
