import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { Badge, SegmentBadge } from '@/components/ui/Badge';
import { FIIFormModal } from '@/components/fii/FIIFormModal';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/contexts/ToastContext';
import { computePositionMetrics } from '@/utils/calculations';
import { formatCurrency, formatPercent, formatNumber, formatDate } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import type { PortfolioPosition } from '@/types/portfolio';

export function Portfolio() {
  const { positions, fiiData, removePosition } = usePortfolio();
  const { show } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<PortfolioPosition | null>(null);

  const rows = useMemo(
    () => positions.map((p) => computePositionMetrics(p, fiiData[p.ticker] ?? null)).sort((a, b) => b.currentValue! - a.currentValue!),
    [positions, fiiData]
  );

  function handleRemove(position: PortfolioPosition) {
    if (confirm(`Remover ${position.ticker} da carteira?`)) {
      removePosition(position.id);
      show('info', `${position.ticker} removido da carteira.`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Carteira</h1>
        <p className="text-sm text-ink-500">Todas as suas posições cadastradas, com preço médio e resultado atual.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posições ({positions.length})</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {positions.length === 0 ? (
            <p className="text-sm text-ink-500 text-center py-12">Nenhuma posição cadastrada ainda.</p>
          ) : (
            <div className="p-5 pt-0">
              <Table>
                <Thead>
                  <tr>
                    <Th>Ticker</Th>
                    <Th>Segmento</Th>
                    <Th className="text-right">Cotas</Th>
                    <Th className="text-right">Preço médio</Th>
                    <Th className="text-right">Cotação atual</Th>
                    <Th className="text-right">Valor investido</Th>
                    <Th className="text-right">Valor atual</Th>
                    <Th className="text-right">Resultado</Th>
                    <Th className="text-right">DY 12m</Th>
                    <Th>Compra</Th>
                    <Th className="text-right">Ações</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {rows.map((m) => (
                    <Tr key={m.position.id} onClick={() => navigate(`/fundos/${m.position.ticker}`)}>
                      <Td className="font-medium text-ink-100">{m.position.ticker}</Td>
                      <Td>{m.fii ? <SegmentBadge segment={m.fii.general.segment} /> : '—'}</Td>
                      <Td className="text-right font-tabular">{formatNumber(m.position.quantity)}</Td>
                      <Td className="text-right font-tabular">{formatCurrency(m.position.averagePrice)}</Td>
                      <Td className="text-right font-tabular">{formatCurrency(m.fii?.quote?.price)}</Td>
                      <Td className="text-right font-tabular">{formatCurrency(m.investedValue)}</Td>
                      <Td className="text-right font-tabular">{formatCurrency(m.currentValue)}</Td>
                      <Td className="text-right">
                        {m.profitLoss !== null ? (
                          <Badge variant={m.profitLoss >= 0 ? 'gain' : 'loss'}>
                            {formatCurrency(m.profitLoss)} ({formatPercent(m.profitLossPercent)})
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </Td>
                      <Td className="text-right font-tabular">{formatPercent(m.currentDY)}</Td>
                      <Td>{formatDate(m.position.purchaseDate)}</Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditing(m.position)}
                            className="p-1.5 rounded-md text-ink-500 hover:bg-base-700 hover:text-ink-100"
                            aria-label="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleRemove(m.position)}
                            className="p-1.5 rounded-md text-ink-500 hover:bg-loss-500/15 hover:text-loss-400"
                            aria-label="Remover"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {editing && <FIIFormModal open={!!editing} onClose={() => setEditing(null)} existing={editing} />}
    </div>
  );
}
