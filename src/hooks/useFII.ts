import { useEffect, useState } from 'react';
import { DataService } from '@/services/DataService';
import type { FII } from '@/types/fii';
import type { DataResult } from '@/types/common';

/** Resolves a single FII by ticker via DataService, exposing loading/error
 * state for a page-level component (e.g. the FII detail page). */
export function useFII(ticker: string | undefined) {
  const [result, setResult] = useState<DataResult<FII> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;
    setLoading(true);
    DataService.getFII(ticker).then((r) => {
      if (!cancelled) {
        setResult(r);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const refresh = async () => {
    if (!ticker) return;
    setLoading(true);
    const r = await DataService.getFII(ticker, { forceRefresh: true });
    setResult(r);
    setLoading(false);
  };

  return { fii: result?.data ?? null, source: result?.source, error: result?.error, loading, refresh };
}
