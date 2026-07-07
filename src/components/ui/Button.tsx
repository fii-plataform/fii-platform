import type { ButtonHTMLAttributes } from 'react';
import { classNames } from '@/utils/formatters';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({ className, variant = 'primary', size = 'md', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' }[size];
  const variants = {
    primary: 'bg-signal-500 text-base-950 hover:bg-signal-400',
    secondary: 'bg-base-600 text-ink-100 hover:bg-base-500',
    ghost: 'bg-transparent text-ink-300 hover:bg-base-700 hover:text-ink-100',
    danger: 'bg-loss-500/15 text-loss-400 border border-loss-500/30 hover:bg-loss-500/25',
  }[variant];

  return (
    <button className={classNames(base, sizes, variants, className)} {...rest}>
      {children}
    </button>
  );
}
