import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { FIICard } from '@/components/fii/FIICard';
import { classNames } from '@/utils/formatters';
import { DataService } from '@/services/DataService';
import { BrapiProvider } from '@/services/BrapiProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { ALL_SEGMENTS, type FII, type FIISegment } from '@/types/fii';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const debouncedQuery = useDebounce(query, 400);
  const [activeSegments, setActiveSegments] = useState<Set<FIISegment>>(new Set());
  const [results, setResults] = useState<FII[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchParams(query ? { q: query } : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const matches = await DataService.searchTickers(debouncedQuery);
      const resolved = await Promise.all(matches.slice(0, 12).map((m) => DataService.getFII(m.ticker)));
      if (!cancelled) {
        setResults(resolved.map((r) => r.data).filter((f): f is FII => !!f));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const filtered = activeSegments.size ? results.filter((f) => activeSegments.has(f.general.segment)) : results;

  function toggleSegment(segment: FIISegment) {
    setActiveSegments((prev) => {
      const next = new Set(prev);
      if (next.has(segment)) next.delete(segment);
      else next.add(segment);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Buscar fundos</h1>
        <p className="text-sm text-ink-500">Pesquise por ticker, nome, segmento ou gestora.</p>
      </div>

      <div className="relative max-w-lg">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex: HGLG11, logístico, XP Asset..." className="pl-9" />
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_SEGMENTS.map((segment) => (
          <button
            key={segment}
            onClick={() => toggleSegment(segment)}
            className={classNames(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              activeSegments.has(segment)
                ? 'border-signal-500 bg-signal-500/15 text-signal-400'
                : 'border-base-600 text-ink-500 hover:border-base-500 hover:text-ink-300'
            )}
          >
            {segment}
          </button>
        ))}
      </div>

      {!BrapiProvider.isConfigured() && (
        <Card className="p-4 text-sm text-ink-500">
          Configure sua chave da BRAPI na tela de Configurações para habilitar a busca ao vivo de fundos.
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((fii) => (
            <FIICard key={fii.general.ticker} fii={fii} />
          ))}
        </div>
      ) : debouncedQuery.trim().length >= 2 ? (
        <p className="text-sm text-ink-500 text-center py-12">Nenhum resultado encontrado.</p>
      ) : null}
    </div>
  );
}
