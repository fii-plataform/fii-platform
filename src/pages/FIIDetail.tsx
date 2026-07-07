import { useParams, Link } from 'react-router-dom';
import { Star, RefreshCw, ArrowLeft } from 'lucide-react';
import { useFII } from '@/hooks/useFII';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { SegmentBadge, Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { FIIMap } from '@/components/fii/FIIMap';
import { PortfolioEvolutionChart } from '@/components/dashboard/PortfolioEvolutionChart';
import { DividendsChart } from '@/components/dashboard/DividendsChart';
import { formatCurrency, formatPercent, formatNumber, formatDate, formatMonthYear } from '@/utils/formatters';

const INDICATOR_LABELS: Array<{ key: keyof NonNullable<ReturnType<typeof useFII>['fii']>['indicators']; label: string; percent?: boolean }> = [
  { key: 'dyTwelveMonths', label: 'DY 12 meses', percent: true },
  { key: 'pvp', label: 'P/VP' },
  { key: 'vacanciaFisica', label: 'Vacância física', percent: true },
  { key: 'vacanciaFinanceira', label: 'Vacância financeira', percent: true },
  { key: 'capRate', label: 'Cap Rate', percent: true },
  { key: 'taxaAdministracao', label: 'Taxa de administração', percent: true },
  { key: 'wault', label: 'WAULT (anos)' },
  { key: 'contratosTipicos', label: 'Contratos típicos', percent: true },
  { key: 'contratosAtipicos', label: 'Contratos atípicos', percent: true },
];

export function FIIDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const { fii, loading, error, source, refresh } = useFII(ticker);
  const { toggleFavorite, isFavorite } = usePortfolio();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!fii) {
    return (
      <div className="text-center py-24">
        <p className="text-ink-500">{error ?? 'Não foi possível carregar os dados deste fundo.'}</p>
        <Link to="/buscar" className="text-signal-400 hover:underline text-sm mt-2 inline-block">
          Voltar para a busca
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(fii.general.ticker);
  const changeUp = (fii.quote?.changePercent ?? 0) >= 0;

  const dividendSeries = fii.dividends
    .slice()
    .sort((a, b) => a.referenceMonth.localeCompare(b.referenceMonth))
    .slice(-12)
    .map((d) => ({ month: d.referenceMonth, value: d.valuePerShare }));

  return (
    <div className="space-y-6">
      <Link to="/carteira" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-100">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink-100">{fii.general.ticker}</h1>
            <SegmentBadge segment={fii.general.segment} />
            {fii.source === 'manual' && <Badge variant="warn">Dados manuais</Badge>}
            {fii.source === 'unavailable' && <Badge variant="loss">Indisponível</Badge>}
          </div>
          <p className="text-sm text-ink-500 mt-1">{fii.general.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(fii.general.ticker)}
            className="flex items-center gap-1.5 rounded-lg border border-base-600 px-3 py-2 text-sm text-ink-300 hover:bg-base-700"
          >
            <Star size={16} fill={favorite ? 'currentColor' : 'none'} className={favorite ? 'text-warn-500' : ''} />
            {favorite ? 'Favoritado' : 'Favoritar'}
          </button>
          <button
            onClick={() => refresh()}
            className="flex items-center gap-1.5 rounded-lg border border-base-600 px-3 py-2 text-sm text-ink-300 hover:bg-base-700"
          >
            <RefreshCw size={15} /> Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cotação</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="font-tabular text-3xl font-semibold text-ink-100">{formatCurrency(fii.quote?.price)}</p>
            <Badge variant={changeUp ? 'gain' : 'loss'}>{formatPercent(fii.quote?.changePercent)}</Badge>
            <p className="text-xs text-ink-700 mt-3">Fonte: {source ?? fii.source} · Atualizado em {formatDate(fii.lastUpdated)}</p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Informações gerais</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <InfoItem label="Gestora" value={fii.general.manager} />
            <InfoItem label="Tipo de fundo" value={fii.general.type} />
            <InfoItem label="Patrimônio líquido" value={formatCurrency(fii.general.netWorth)} />
            <InfoItem label="Valor patrimonial/cota" value={formatCurrency(fii.general.shareValue)} />
            <InfoItem label="Liquidez diária" value={formatCurrency(fii.general.liquidityDaily)} />
            <InfoItem label="Nº de cotistas" value={formatNumber(fii.general.shareholderCount)} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores</CardTitle>
        </CardHeader>
        <CardBody className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {INDICATOR_LABELS.map(({ key, label, percent }) => (
            <div key={key}>
              <p className="text-xs text-ink-700">{label}</p>
              <p className="font-tabular font-medium text-ink-100">
                {percent ? formatPercent(fii.indicators[key] as number | null) : fii.indicators[key] ?? '—'}
              </p>
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dividendos (últimos 12 meses)</CardTitle>
          </CardHeader>
          <CardBody className="h-64">
            <DividendsChart points={dividendSeries} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de patrimônio</CardTitle>
          </CardHeader>
          <CardBody className="h-64">
            {fii.history.length ? (
              <PortfolioEvolutionChart points={fii.history.map((h) => ({ date: h.date, value: h.netWorth ?? 0 }))} />
            ) : (
              <p className="text-sm text-ink-500 text-center py-16">
                Histórico patrimonial ainda não disponível via API — pode ser complementado manualmente nas Configurações.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfólio de imóveis</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <InfoItem label="Nº de imóveis" value={formatNumber(fii.portfolio.propertyCount)} />
            <InfoItem label="Principais locatários" value={fii.portfolio.mainTenants.map((t) => t.name).join(', ') || '—'} />
          </div>
          <FIIMap properties={fii.portfolio.properties} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de rendimentos</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <div className="max-h-72 overflow-y-auto divide-y divide-base-600">
            {fii.dividends.length === 0 ? (
              <p className="text-sm text-ink-500 text-center py-8">Nenhum registro de dividendo disponível.</p>
            ) : (
              fii.dividends.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-ink-500">{formatMonthYear(d.referenceMonth)}</span>
                  <span className="text-ink-700">Pagamento em {formatDate(d.paymentDate)}</span>
                  <span className="font-tabular text-ink-100">{formatCurrency(d.valuePerShare)}</span>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-700">{label}</p>
      <p className="font-medium text-ink-100 truncate">{value}</p>
    </div>
  );
}
