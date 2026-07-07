import '@/components/dashboard/chartSetup';
import { Bar } from 'react-chartjs-2';
import { CHART_GRID_COLOR, CHART_TEXT_COLOR, CHART_ACCENT } from '@/components/dashboard/chartSetup';
import { formatCurrency, formatMonthYear } from '@/utils/formatters';

export interface DividendPoint {
  month: string;
  value: number;
}

export function DividendsChart({ points }: { points: DividendPoint[] }) {
  if (points.length === 0) {
    return <p className="text-sm text-ink-500 py-8 text-center">Nenhum dividendo registrado ainda.</p>;
  }

  const data = {
    labels: points.map((p) => formatMonthYear(p.month)),
    datasets: [
      {
        label: 'Dividendos',
        data: points.map((p) => p.value),
        backgroundColor: CHART_ACCENT,
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => formatCurrency(ctx.parsed.y) } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: CHART_TEXT_COLOR } },
          y: {
            grid: { color: CHART_GRID_COLOR },
            ticks: { color: CHART_TEXT_COLOR, callback: (v) => formatCurrency(Number(v), { compact: true }) },
          },
        },
      }}
    />
  );
}
