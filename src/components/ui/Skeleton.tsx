import { classNames } from '@/utils/formatters';

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames('skeleton rounded-md', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-base-600 bg-base-800 p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
