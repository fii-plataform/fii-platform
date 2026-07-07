import type { PortfolioPosition } from '@/types/portfolio';
import type { FII } from '@/types/fii';

export interface PositionMetrics {
  position: PortfolioPosition;
  fii: FII | null;
  investedValue: number;
  currentValue: number | null;
  profitLoss: number | null;
  profitLossPercent: number | null;
  currentDY: number | null;
}

export function computePositionMetrics(position: PortfolioPosition, fii: FII | null): PositionMetrics {
  const investedValue = position.quantity * position.averagePrice;
  const price = fii?.quote?.price ?? null;
  const currentValue = price !== null ? price * position.quantity : null;
  const profitLoss = currentValue !== null ? currentValue - investedValue : null;
  const profitLossPercent = profitLoss !== null && investedValue > 0 ? (profitLoss / investedValue) * 100 : null;
  const currentDY = fii?.indicators.dyTwelveMonths ?? null;

  return { position, fii, investedValue, currentValue, profitLoss, profitLossPercent, currentDY };
}

export function sumInvested(metrics: PositionMetrics[]): number {
  return metrics.reduce((acc, m) => acc + m.investedValue, 0);
}

export function sumCurrentValue(metrics: PositionMetrics[]): number {
  return metrics.reduce((acc, m) => acc + (m.currentValue ?? m.investedValue), 0);
}

export function weightedAverageDY(metrics: PositionMetrics[]): number | null {
  const withDY = metrics.filter((m) => m.currentDY !== null && (m.currentValue ?? 0) > 0);
  if (withDY.length === 0) return null;
  const totalValue = withDY.reduce((acc, m) => acc + (m.currentValue ?? 0), 0);
  if (totalValue === 0) return null;
  const weighted = withDY.reduce((acc, m) => acc + (m.currentDY as number) * (m.currentValue ?? 0), 0);
  return weighted / totalValue;
}

/** Sums received dividends for a position across all recorded dividend events
 * paid on or after the purchase date. */
export function dividendsReceivedForPosition(position: PortfolioPosition, fii: FII | null): number {
  if (!fii) return 0;
  const purchaseDate = new Date(position.purchaseDate).getTime();
  return fii.dividends
    .filter((d) => new Date(d.paymentDate).getTime() >= purchaseDate)
    .reduce((acc, d) => acc + d.valuePerShare * position.quantity, 0);
}

export function allocationBySegment(metrics: PositionMetrics[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const m of metrics) {
    const segment = m.fii?.general.segment ?? 'Outros';
    const value = m.currentValue ?? m.investedValue;
    result[segment] = (result[segment] ?? 0) + value;
  }
  return result;
}

export function allocationByType(metrics: PositionMetrics[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const m of metrics) {
    const type = m.fii?.general.type ?? 'Outros';
    const value = m.currentValue ?? m.investedValue;
    result[type] = (result[type] ?? 0) + value;
  }
  return result;
}
