import '@/components/dashboard/chartSetup';
import { Line } from 'react-chartjs-2';
import { CHART_GRID_COLOR, CHART_TEXT_COLOR, CHART_ACCENT } from '@/components/dashboard/chartSetup';
import { formatCurrency, formatMonthYear } from '@/utils/formatters';

export interface EvolutionPoint {
  date: string;
  value: number;
}

export function PortfolioEvolutionChart({ points }: { points: EvolutionPoint[] }) {
  const data = {
    labels: points.map((p) => formatMonthYear(p.date)),
    datasets: [
      {
        label: 'Patrimônio',
        data: points.map((p) => p.value),
        borderColor: CHART_ACCENT,
        backgroundColor: 'rgba(31, 209, 184, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => formatCurrency(ctx.parsed.y) },
          },
        },
        scales: {
          x: { grid: { color: CHART_GRID_COLOR }, ticks: { color: CHART_TEXT_COLOR } },
          y: {
            grid: { color: CHART_GRID_COLOR },
            ticks: { color: CHART_TEXT_COLOR, callback: (v) => formatCurrency(Number(v), { compact: true }) },
          },
        },
      }}
    />
  );
}
