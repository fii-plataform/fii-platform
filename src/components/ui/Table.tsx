import type { ReactNode } from 'react';
import { classNames } from '@/utils/formatters';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-base-600">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-base-700/60 text-left text-xs uppercase tracking-wide text-ink-500">{children}</thead>;
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={classNames('px-4 py-3 font-medium whitespace-nowrap', className)}>{children}</th>;
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-base-600">{children}</tbody>;
}

export function Tr({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={classNames('transition-colors', onClick && 'cursor-pointer hover:bg-base-700/40', className)}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={classNames('px-4 py-3 whitespace-nowrap text-ink-300', className)}>{children}</td>;
}
