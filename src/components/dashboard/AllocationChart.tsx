import '@/components/dashboard/chartSetup';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '@/utils/formatters';

const PALETTE = ['#3FA7D6', '#F2B134', '#7B61FF', '#1FD1B8', '#C77DFF', '#FF8FA3', '#8BC34A', '#FF6F61', '#FFC857', '#5B6473'];

export function AllocationChart({ allocation }: { allocation: Record<string, number> }) {
  const entries = Object.entries(allocation).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((acc, [, v]) => acc + v, 0);

  if (entries.length === 0) {
    return <p className="text-sm text-ink-500 py-8 text-center">Sem posições cadastradas ainda.</p>;
  }

  const data = {
    labels: entries.map(([label]) => label),
    datasets: [
      {
        data: entries.map(([, value]) => value),
        backgroundColor: PALETTE,
        borderColor: '#12151C',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="flex items-center gap-6">
      <div className="w-40 h-40 shrink-0">
        <Doughnut
          data={data}
          options={{
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.label}: ${formatCurrency(Number(ctx.raw))} (${(((ctx.raw as number) / total) * 100).toFixed(1)}%)`,
                },
              },
            },
            cutout: '68%',
          }}
        />
      </div>
      <ul className="flex-1 space-y-2 text-sm">
        {entries.map(([label, value], i) => (
          <li key={label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-ink-300 truncate">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
              {label}
            </span>
            <span className="font-tabular text-ink-500 shrink-0">{((value / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
