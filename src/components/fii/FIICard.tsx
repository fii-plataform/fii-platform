import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { SegmentBadge, Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent, classNames } from '@/utils/formatters';
import { usePortfolio } from '@/contexts/PortfolioContext';
import type { FII } from '@/types/fii';

export function FIICard({ fii }: { fii: FII }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = usePortfolio();
  const favorite = isFavorite(fii.general.ticker);
  const changeUp = (fii.quote?.changePercent ?? 0) >= 0;

  return (
    <Card
      className="p-4 cursor-pointer hover:border-signal-500/40 transition-colors group"
      onClick={() => navigate(`/fundos/${fii.general.ticker}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <p className="font-display font-semibold text-ink-100">{fii.general.ticker}</p>
          <p className="text-xs text-ink-500 truncate max-w-[180px]">{fii.general.name}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(fii.general.ticker);
          }}
          aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="text-ink-700 hover:text-warn-500 transition-colors shrink-0"
        >
          <Star size={18} fill={favorite ? 'currentColor' : 'none'} className={favorite ? 'text-warn-500' : ''} />
        </button>
      </div>

      <SegmentBadge segment={fii.general.segment} />

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-ink-500">Cotação</p>
          <p className="font-tabular font-semibold text-ink-100">{formatCurrency(fii.quote?.price)}</p>
        </div>
        <Badge variant={changeUp ? 'gain' : 'loss'}>{formatPercent(fii.quote?.changePercent)}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-ink-700">DY 12m</p>
          <p className={classNames('font-tabular', 'text-ink-300')}>{formatPercent(fii.indicators.dyTwelveMonths)}</p>
        </div>
        <div>
          <p className="text-ink-700">P/VP</p>
          <p className="font-tabular text-ink-300">{fii.indicators.pvp ? fii.indicators.pvp.toFixed(2) : '—'}</p>
        </div>
      </div>
    </Card>
  );
}
