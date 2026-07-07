import { BrapiProvider } from '@/services/BrapiProvider';
import { StorageService } from '@/services/StorageService';
import { CACHE_TTL_MS } from '@/config/constants';
import type { FII } from '@/types/fii';
import type { DataResult } from '@/types/common';
import type { ManualFIIOverride } from '@/types/portfolio';

/**
 * DataService is the ONLY place the rest of the app should ask for FII data.
 * It implements the priority chain requested in the brief:
 *
 *   1. BRAPI (live market data)
 *   2. Other public/official APIs (slot ready — see `otherProviders` below)
 *   3. Data the user typed in manually (manual overrides), as a last resort
 *
 * If every source fails, DataService returns a `DataResult` with
 * `source: 'unavailable'` instead of throwing — callers render an empty/error
 * state instead of crashing. Nothing in this file assumes BRAPI (or any single
 * provider) is guaranteed to succeed.
 *
 * To add a new provider (e.g. a future official B3/CVM API), implement the
 * same `fetchFII(ticker): Promise<FII | null>` contract and push it into
 * `otherProviders` below — no other file needs to change.
 */

// Slot for additional public providers. Empty today; wire in real providers
// here as they become available, in the order they should be tried.
const otherProviders: Array<{ name: string; fetchFII: (ticker: string) => Promise<FII | null> }> = [];

function applyManualOverride(base: FII | null, ticker: string, override: ManualFIIOverride | undefined): FII | null {
  if (!override) return base;
  if (!base) {
    // No API data at all — build a minimal record entirely from manual data.
    return {
      general: {
        name: (override.data.name as string) ?? ticker,
        ticker,
        segment: (override.data.segment as FII['general']['segment']) ?? 'Outros',
        type: (override.data.type as FII['general']['type']) ?? 'Tijolo',
        manager: (override.data.manager as string) ?? '—',
        netWorth: (override.data.netWorth as number) ?? null,
        shareValue: (override.data.shareValue as number) ?? null,
        liquidityDaily: (override.data.liquidityDaily as number) ?? null,
        shareholderCount: (override.data.shareholderCount as number) ?? null,
      },
      quote: null,
      indicators: {
        dyTwelveMonths: null,
        pvp: null,
        vacanciaFisica: null,
        vacanciaFinanceira: null,
        capRate: null,
        taxaAdministracao: null,
        wault: null,
        contratosTipicos: null,
        contratosAtipicos: null,
      },
      dividends: [],
      portfolio: { propertyCount: null, properties: [], mainTenants: [] },
      history: [],
      source: 'manual',
      lastUpdated: override.updatedAt,
    };
  }
  // Merge: manual fields fill in gaps, never overwrite live data that already exists.
  return {
    ...base,
    general: { ...base.general, ...(override.data.general as object) },
    indicators: { ...base.indicators, ...(override.data.indicators as object) },
    portfolio: { ...base.portfolio, ...(override.data.portfolio as object) },
    source: 'mixed',
  };
}

export const DataService = {
  /** Resolves one FII record, walking the fallback chain and applying cache
   * + manual overrides. This is the single call sites should use. */
  async getFII(ticker: string, opts?: { forceRefresh?: boolean }): Promise<DataResult<FII>> {
    const normalizedTicker = ticker.toUpperCase().trim();

    // 1. Serve from cache if fresh, unless caller asked to bypass it.
    if (!opts?.forceRefresh) {
      const cached = StorageService.getCachedFII<FII>(normalizedTicker);
      if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        return { data: cached.data, source: 'cache' };
      }
    }

    const overrides = StorageService.getManualOverrides();
    const override = overrides.find((o) => o.ticker === normalizedTicker);

    // 2. Try BRAPI first.
    let fii: FII | null = null;
    let resolvedSource: DataResult<FII>['source'] = 'unavailable';

    if (BrapiProvider.isConfigured()) {
      fii = await BrapiProvider.fetchFII(normalizedTicker);
      if (fii) resolvedSource = 'brapi';
    }

    // 3. Fall through additional public providers, in order, if BRAPI didn't answer.
    if (!fii) {
      for (const provider of otherProviders) {
        try {
          fii = await provider.fetchFII(normalizedTicker);
          if (fii) {
            resolvedSource = 'brapi'; // treated the same tier as BRAPI for UI purposes
            break;
          }
        } catch (err) {
          console.warn(`DataService: provider "${provider.name}" failed`, err);
        }
      }
    }

    // 4. Layer manual data on top (fills gaps, or is the entire record if
    // no API answered at all).
    const merged = applyManualOverride(fii, normalizedTicker, override);
    if (merged && !fii && override) resolvedSource = 'manual';

    if (!merged) {
      return { data: null, source: 'unavailable', error: 'Nenhuma fonte de dados disponível para este ticker.' };
    }

    StorageService.setCachedFII(normalizedTicker, merged);
    return { data: merged, source: resolvedSource };
  },

  /** Batch helper for dashboard/portfolio views — resolves many tickers
   * concurrently, still never throwing. */
  async getMany(tickers: string[]): Promise<Record<string, DataResult<FII>>> {
    const unique = Array.from(new Set(tickers.map((t) => t.toUpperCase().trim())));
    const results = await Promise.all(unique.map((t) => this.getFII(t)));
    const map: Record<string, DataResult<FII>> = {};
    unique.forEach((t, i) => (map[t] = results[i]));
    return map;
  },

  async searchTickers(query: string) {
    if (BrapiProvider.isConfigured()) {
      const results = await BrapiProvider.searchTickers(query);
      if (results.length) return results;
    }
    return [];
  },

  saveManualOverride(ticker: string, data: Record<string, unknown>): void {
    const overrides = StorageService.getManualOverrides();
    const normalizedTicker = ticker.toUpperCase().trim();
    const idx = overrides.findIndex((o) => o.ticker === normalizedTicker);
    const entry: ManualFIIOverride = { ticker: normalizedTicker, data, updatedAt: new Date().toISOString() };
    if (idx >= 0) overrides[idx] = entry;
    else overrides.push(entry);
    StorageService.saveManualOverrides(overrides);
  },
};
