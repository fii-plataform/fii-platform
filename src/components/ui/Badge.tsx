import type { ReactNode } from 'react';
import { classNames } from '@/utils/formatters';
import { SEGMENT_COLOR_KEY, type FIISegment } from '@/types/fii';

const SEGMENT_BG: Record<string, string> = {
  logistico: 'bg-segment-logistico/15 text-segment-logistico border-segment-logistico/30',
  shopping: 'bg-segment-shopping/15 text-segment-shopping border-segment-shopping/30',
  escritorios: 'bg-segment-escritorios/15 text-segment-escritorios border-segment-escritorios/30',
  papel: 'bg-segment-papel/15 text-segment-papel border-segment-papel/30',
  fof: 'bg-segment-fof/15 text-segment-fof border-segment-fof/30',
  hibrido: 'bg-segment-hibrido/15 text-segment-hibrido border-segment-hibrido/30',
  agro: 'bg-segment-agro/15 text-segment-agro border-segment-agro/30',
  hospitalar: 'bg-segment-hospitalar/15 text-segment-hospitalar border-segment-hospitalar/30',
  educacional: 'bg-segment-educacional/15 text-segment-educacional border-segment-educacional/30',
};

export function SegmentBadge({ segment }: { segment: FIISegment }) {
  const key = SEGMENT_COLOR_KEY[segment] ?? 'papel';
  return (
    <span className={classNames('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', SEGMENT_BG[key])}>
      {segment}
    </span>
  );
}

export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: 'neutral' | 'gain' | 'loss' | 'warn' }) {
  const styles = {
    neutral: 'bg-base-600/50 text-ink-300 border-base-500',
    gain: 'bg-gain-500/15 text-gain-400 border-gain-500/30',
    loss: 'bg-loss-500/15 text-loss-400 border-loss-500/30',
    warn: 'bg-warn-500/15 text-warn-500 border-warn-500/30',
  }[variant];

  return <span className={classNames('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', styles)}>{children}</span>;
}
