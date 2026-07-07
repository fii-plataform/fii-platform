import type { HTMLAttributes } from 'react';
import { classNames } from '@/utils/formatters';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames(
        'rounded-xl border border-base-600 bg-base-800 shadow-panel',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classNames('flex items-center justify-between px-5 py-4 border-b border-base-600', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={classNames('font-display text-sm font-semibold tracking-wide text-ink-100 uppercase', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classNames('p-5', className)} {...rest}>
      {children}
    </div>
  );
}
