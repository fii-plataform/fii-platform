import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { PortfolioEvolutionChart } from '@/components/dashboard/PortfolioEvolutionChart';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { DividendsChart } from '@/components/dashboard/DividendsChart';
import { usePortfolio } from '@/contexts/PortfolioContext';
import {
  computePositionMetrics,
  sumInvested,
  sumCurrentValue,
  weightedAverageDY,
  allocationBySegment,
  allocationByType,
  dividendsReceivedForPosition,
} from '@/utils/calculations';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { positions, fiiData, loading } = usePortfolio();

  const metrics = useMemo(
    () => positions.map((p) => computePositionMetrics(p, fiiData[p.ticker] ?? null)),
    [positions, fiiData]
  );

  const investedValue = sumInvested(metrics);
  const currentValue = sumCurrentValue(metrics);
  const averageDY = weightedAverageDY(metrics);
  const segmentAllocation = allocationBySegment(metrics);
  const typeAllocation = allocationByType(metrics);

  const totalDividendsReceived = metrics.reduce((acc, m) => acc + dividendsReceivedForPosition(m.position, m.fii), 0);

  const shareCount = positions.reduce((acc, p) => acc + p.quantity, 0);

  // Last month's dividend income across the whole portfolio, and a monthly
  // series for the chart — derived directly from each fund's dividend history.
  const dividendSeries = useMemo(() => {
    const byMonth: Record<string, number> = {};
    metrics.forEach((m) => {
      m.fii?.dividends.forEach((d) => {
        byMonth[d.referenceMonth] = (byMonth[d.referenceMonth] ?? 0) + d.valuePerShare * m.position.quantity;
      });
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, value]) => ({ month, value }));
  }, [metrics]);

  const monthlyIncome = dividendSeries.at(-1)?.value ?? 0;

  // Simplified equity-curve approximation: invested capital plus cumulative
  // dividends over time. A precise historical patrimony series would need
  // daily price history per fund, which BRAPI's free tier doesn't expose —
  // this gives a directionally honest view without inventing numbers.
  const evolutionSeries = useMemo(() => {
    let cumulative = 0;
    return dividendSeries.map((d) => {
      cumulative += d.value;
      return { date: d.month, value: investedValue + cumulative };
    });
  }, [dividendSeries, investedValue]);

  if (positions.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <h2 className="font-display text-lg font-semibold text-ink-100">Sua carteira está vazia</h2>
        <p className="text-sm text-ink-500 max-w-sm">
          Adicione sua primeira posição pelo botão "Adicionar posição" no topo, ou explore fundos na tela de
          <Link to="/buscar" className="text-signal-400 hover:underline"> Busca</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Dashboard</h1>
        <p className="text-sm text-ink-500">Visão consolidada da sua carteira de FIIs.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <SummaryCards
          investedValue={investedValue}
          currentValue={currentValue}
          monthlyIncome={monthlyIncome}
          totalDividendsReceived={totalDividendsReceived}
          averageDY={averageDY}
          fiiCount={positions.length}
          shareCount={shareCount}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Evolução patrimonial</CardTitle>
          </CardHeader>
          <CardBody className="h-72">
            <PortfolioEvolutionChart points={evolutionSeries} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alocação por segmento</CardTitle>
          </CardHeader>
          <CardBody>
            <AllocationChart allocation={segmentAllocation} />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Evolução dos dividendos</CardTitle>
          </CardHeader>
          <CardBody className="h-72">
            <DividendsChart points={dividendSeries} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alocação por tipo de fundo</CardTitle>
          </CardHeader>
          <CardBody>
            <AllocationChart allocation={typeAllocation} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
