import { usePortfolio } from '@/contexts/PortfolioContext';
import { FIICard } from '@/components/fii/FIICard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Star } from 'lucide-react';

export function Favorites() {
  const { favorites, fiiData, loading } = usePortfolio();

  const fiis = favorites.map((t) => fiiData[t]).filter((f): f is NonNullable<typeof f> => !!f);

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <Star size={32} className="text-ink-700" />
        <h2 className="font-display text-lg font-semibold text-ink-100">Nenhum favorito ainda</h2>
        <p className="text-sm text-ink-500 max-w-sm">
          Marque fundos como favoritos na busca ou na página de detalhes para acompanhá-los aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Favoritos</h1>
        <p className="text-sm text-ink-500">Fundos que você está acompanhando de perto.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && fiis.length === 0
          ? Array.from({ length: favorites.length }).map((_, i) => <SkeletonCard key={i} />)
          : fiis.map((fii) => <FIICard key={fii.general.ticker} fii={fii} />)}
      </div>
    </div>
  );
}
