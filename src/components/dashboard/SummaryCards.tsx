import { TrendingUp, Wallet, Coins, Percent, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';

interface SummaryCardsProps {
  investedValue: number;
  currentValue: number;
  monthlyIncome: number;
  totalDividendsReceived: number;
  averageDY: number | null;
  fiiCount: number;
  shareCount: number;
}

export function SummaryCards(props: SummaryCardsProps) {
  const profitLoss = props.currentValue - props.investedValue;
  const profitLossPercent = props.investedValue > 0 ? (profitLoss / props.investedValue) * 100 : 0;

  const items = [
    {
      label: 'Patrimônio investido',
      value: formatCurrency(props.investedValue),
      icon: Wallet,
    },
    {
      label: 'Patrimônio atual',
      value: formatCurrency(props.currentValue),
      icon: TrendingUp,
      sub: `${profitLoss >= 0 ? '+' : ''}${formatCurrency(profitLoss)} (${formatPercent(profitLossPercent)})`,
      subPositive: profitLoss >= 0,
    },
    {
      label: 'Dividendos recebidos',
      value: formatCurrency(props.totalDividendsReceived),
      icon: Coins,
    },
    {
      label: 'Renda mensal (última)',
      value: formatCurrency(props.monthlyIncome),
      icon: Coins,
    },
    {
      label: 'DY médio da carteira',
      value: formatPercent(props.averageDY),
      icon: Percent,
    },
    {
      label: 'Fundos / Cotas',
      value: `${formatNumber(props.fiiCount)} / ${formatNumber(props.shareCount)}`,
      icon: Layers,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {items.map(({ label, value, icon: Icon, sub, subPositive }) => (
        <Card key={label} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-500 uppercase tracking-wide">{label}</span>
            <Icon size={16} className="text-signal-500/70" />
          </div>
          <p className="font-tabular font-semibold text-lg text-ink-100">{value}</p>
          {sub && <p className={`text-xs font-tabular mt-0.5 ${subPositive ? 'text-gain-400' : 'text-loss-400'}`}>{sub}</p>}
        </Card>
      ))}
    </div>
  );
}
