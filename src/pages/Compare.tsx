import { useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SegmentBadge } from '@/components/ui/Badge';
import { DataService } from '@/services/DataService';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/formatters';
import type { FII } from '@/types/fii';

const MAX_COMPARE = 4;

const ROWS: Array<{ label: string; get: (f: FII) => string }> = [
  { label: 'Segmento', get: (f) => f.general.segment },
  { label: 'Gestora', get: (f) => f.general.manager },
  { label: 'Cotação', get: (f) => formatCurrency(f.quote?.price) },
  { label: 'DY 12 meses', get: (f) => formatPercent(f.indicators.dyTwelveMonths) },
  { label: 'P/VP', get: (f) => (f.indicators.pvp ? f.indicators.pvp.toFixed(2) : '—') },
  { label: 'Vacância física', get: (f) => formatPercent(f.indicators.vacanciaFisica) },
  { label: 'Liquidez diária', get: (f) => formatCurrency(f.general.liquidityDaily) },
  { label: 'Patrimônio líquido', get: (f) => formatCurrency(f.general.netWorth) },
  { label: 'Nº de cotistas', get: (f) => formatNumber(f.general.shareholderCount) },
  { label: 'Últ. dividendo/cota', get: (f) => formatCurrency(f.dividends[0]?.valuePerShare) },
];

export function Compare() {
  const [slots, setSlots] = useState<(FII | null)[]>([null, null, null, null]);
  const [inputs, setInputs] = useState<string[]>(['', '', '', '']);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  async function handleAdd(index: number) {
    const ticker = inputs[index].trim();
    if (!ticker) return;
    setLoadingIndex(index);
    const result = await DataService.getFII(ticker);
    setLoadingIndex(null);
    if (result.data) {
      setSlots((prev) => {
        const next = [...prev];
        next[index] = result.data;
        return next;
      });
    }
  }

  function handleRemove(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setInputs((prev) => {
      const next = [...prev];
      next[index] = '';
      return next;
    });
  }

  const filledSlots = slots.filter((s): s is FII => !!s);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Comparador de fundos</h1>
        <p className="text-sm text-ink-500">Compare até {MAX_COMPARE} FIIs lado a lado.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map((slot, i) => (
          <Card key={i} className="p-4">
            {slot ? (
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-ink-100">{slot.general.ticker}</p>
                  <SegmentBadge segment={slot.general.segment} />
                </div>
                <button onClick={() => handleRemove(i)} className="text-ink-700 hover:text-loss-400">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAdd(i);
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Ticker"
                  value={inputs[i]}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setInputs((prev) => {
                      const next = [...prev];
                      next[i] = val;
                      return next;
                    });
                  }}
                />
                <button
                  type="submit"
                  disabled={loadingIndex === i}
                  className="shrink-0 rounded-lg bg-signal-500 px-3 text-sm font-medium text-base-950 hover:bg-signal-400 disabled:opacity-50"
                >
                  {loadingIndex === i ? '...' : 'Add'}
                </button>
              </form>
            )}
          </Card>
        ))}
      </div>

      {filledSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação</CardTitle>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-base-700/60 text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-3 font-medium">Indicador</th>
                  {filledSlots.map((f) => (
                    <th key={f.general.ticker} className="px-5 py-3 font-medium">
                      {f.general.ticker}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-base-600">
                {ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className="px-5 py-3 text-ink-500">{row.label}</td>
                    {filledSlots.map((f) => (
                      <td key={f.general.ticker} className="px-5 py-3 font-tabular text-ink-100">
                        {row.get(f)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
