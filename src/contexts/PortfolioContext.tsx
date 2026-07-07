import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { StorageService } from '@/services/StorageService';
import { DataService } from '@/services/DataService';
import type { PortfolioPosition, FavoriteEntry } from '@/types/portfolio';
import type { FII } from '@/types/fii';

interface PortfolioContextValue {
  positions: PortfolioPosition[];
  favorites: string[];
  fiiData: Record<string, FII | null>;
  loading: boolean;
  addPosition: (input: Omit<PortfolioPosition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePosition: (id: string, input: Partial<PortfolioPosition>) => void;
  removePosition: (id: string) => void;
  toggleFavorite: (ticker: string) => void;
  isFavorite: (ticker: string) => boolean;
  refresh: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<PortfolioPosition[]>(() => StorageService.getPositions());
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(() => StorageService.getFavorites());
  const [fiiData, setFiiData] = useState<Record<string, FII | null>>({});
  const [loading, setLoading] = useState(false);

  const tickers = useMemo(() => {
    const fromPositions = positions.map((p) => p.ticker);
    const fromFavorites = favorites.map((f) => f.ticker);
    return Array.from(new Set([...fromPositions, ...fromFavorites]));
  }, [positions, favorites]);

  const refresh = useCallback(async () => {
    if (tickers.length === 0) {
      setFiiData({});
      return;
    }
    setLoading(true);
    try {
      const results = await DataService.getMany(tickers);
      const next: Record<string, FII | null> = {};
      for (const t of tickers) next[t] = results[t]?.data ?? null;
      setFiiData(next);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers.join(',')]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPosition = useCallback((input: Omit<PortfolioPosition, 'id' | 'createdAt' | 'updatedAt'>) => {
    setPositions((prev) => {
      const now = new Date().toISOString();
      const next = [
        ...prev,
        { ...input, ticker: input.ticker.toUpperCase(), id: crypto.randomUUID(), createdAt: now, updatedAt: now },
      ];
      StorageService.savePositions(next);
      return next;
    });
  }, []);

  const updatePosition = useCallback((id: string, input: Partial<PortfolioPosition>) => {
    setPositions((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...input, updatedAt: new Date().toISOString() } : p));
      StorageService.savePositions(next);
      return next;
    });
  }, []);

  const removePosition = useCallback((id: string) => {
    setPositions((prev) => {
      const next = prev.filter((p) => p.id !== id);
      StorageService.savePositions(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((ticker: string) => {
    const normalized = ticker.toUpperCase();
    setFavorites((prev) => {
      const exists = prev.some((f) => f.ticker === normalized);
      const next = exists
        ? prev.filter((f) => f.ticker !== normalized)
        : [...prev, { ticker: normalized, addedAt: new Date().toISOString() }];
      StorageService.saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((ticker: string) => favorites.some((f) => f.ticker === ticker.toUpperCase()), [favorites]);

  const value: PortfolioContextValue = {
    positions,
    favorites: favorites.map((f) => f.ticker),
    fiiData,
    loading,
    addPosition,
    updatePosition,
    removePosition,
    toggleFavorite,
    isFavorite,
    refresh,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
