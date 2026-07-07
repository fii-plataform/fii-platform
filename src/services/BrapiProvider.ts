import { BRAPI_BASE_URL } from '@/config/constants';
import { StorageService } from '@/services/StorageService';
import type { FII, FIIDividendEvent, FIIHistoricalPoint, FIISegment, FIIType } from '@/types/fii';

/**
 * BrapiProvider is a thin, isolated wrapper around the BRAPI REST API
 * (https://brapi.dev). It knows nothing about fallback logic or caching —
 * that's DataService's job. This file only knows how to ask BRAPI for data
 * and translate BRAPI's shape into our normalized `FII` type.
 */

interface BrapiQuoteResponse {
  results?: Array<{
    symbol: string;
    shortName?: string;
    longName?: string;
    regularMarketPrice?: number;
    regularMarketChangePercent?: number;
    regularMarketTime?: string;
    dividendsData?: {
      cashDividends?: Array<{
        paymentDate?: string;
        rate?: number;
        relatedTo?: string;
      }>;
    };
    fundsExplorer?: unknown;
  }>;
}

function guessSegment(name: string): FIISegment {
  const n = name.toLowerCase();
  if (n.includes('logíst') || n.includes('logist')) return 'Logístico';
  if (n.includes('shopping')) return 'Shopping';
  if (n.includes('escrit') || n.includes('corporate') || n.includes('office')) return 'Escritórios';
  if (n.includes('papel') || n.includes('cri') || n.includes('recebí')) return 'Papel';
  if (n.includes('fof') || n.includes('fundo de fundos')) return 'FoF';
  if (n.includes('híbrid') || n.includes('hibrid')) return 'Híbrido';
  if (n.includes('agro') || n.includes('rural')) return 'Agro';
  if (n.includes('hospital') || n.includes('saúde') || n.includes('saude')) return 'Hospitalar';
  if (n.includes('educ')) return 'Educacional';
  return 'Outros';
}

function guessType(segment: FIISegment): FIIType {
  if (segment === 'Papel') return 'Papel';
  if (segment === 'FoF') return 'FoF';
  if (segment === 'Híbrido') return 'Híbrido';
  return 'Tijolo';
}

export const BrapiProvider = {
  isConfigured(): boolean {
    return StorageService.getBrapiToken().trim().length > 0;
  },

  /** Fetches quote + basic fundamentals for a single ticker. Returns null on
   * any failure so the caller (DataService) can move to the next source. */
  async fetchFII(ticker: string): Promise<FII | null> {
    const token = StorageService.getBrapiToken();
    if (!token) return null;

    try {
      const url = `${BRAPI_BASE_URL}/quote/${encodeURIComponent(ticker)}?dividends=true&token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      if (!res.ok) return null;

      const json: BrapiQuoteResponse = await res.json();
      const result = json.results?.[0];
      if (!result) return null;

      const name = result.longName ?? result.shortName ?? ticker;
      const segment = guessSegment(name);
      const type = guessType(segment);

      const dividends: FIIDividendEvent[] = (result.dividendsData?.cashDividends ?? [])
        .filter((d) => d.paymentDate && d.rate)
        .map((d) => ({
          referenceMonth: (d.relatedTo ?? d.paymentDate!).slice(0, 7),
          paymentDate: d.paymentDate as string,
          valuePerShare: d.rate as number,
        }))
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

      const history: FIIHistoricalPoint[] = []; // BRAPI historical endpoint can be layered in here later

      const fii: FII = {
        general: {
          name,
          ticker: result.symbol ?? ticker,
          segment,
          type,
          manager: '—', // BRAPI's free tier doesn't expose gestora; fill via manual override
          netWorth: null,
          shareValue: null,
          liquidityDaily: null,
          shareholderCount: null,
        },
        quote: result.regularMarketPrice
          ? {
              price: result.regularMarketPrice,
              changePercent: result.regularMarketChangePercent ?? 0,
              updatedAt: result.regularMarketTime ?? new Date().toISOString(),
            }
          : null,
        indicators: {
          dyTwelveMonths: dividends.length
            ? (dividends.slice(0, 12).reduce((a, d) => a + d.valuePerShare, 0) / (result.regularMarketPrice || 1)) * 100
            : null,
          pvp: null,
          vacanciaFisica: null,
          vacanciaFinanceira: null,
          capRate: null,
          taxaAdministracao: null,
          wault: null,
          contratosTipicos: null,
          contratosAtipicos: null,
        },
        dividends,
        portfolio: { propertyCount: null, properties: [], mainTenants: [] },
        history,
        source: 'brapi',
        lastUpdated: new Date().toISOString(),
      };

      return fii;
    } catch (err) {
      console.warn(`BrapiProvider: failed to fetch ${ticker}`, err);
      return null;
    }
  },

  /** Lightweight search across BRAPI-listed FIIs, used by the global search
   * and ticker autocomplete in the "add position" form. */
  async searchTickers(query: string): Promise<Array<{ ticker: string; name: string }>> {
    const token = StorageService.getBrapiToken();
    if (!token || query.trim().length < 2) return [];

    try {
      const url = `${BRAPI_BASE_URL}/quote/list?search=${encodeURIComponent(query)}&type=fund&token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      const stocks = (json.stocks ?? []) as Array<{ stock: string; name: string }>;
      return stocks.map((s) => ({ ticker: s.stock, name: s.name }));
    } catch (err) {
      console.warn('BrapiProvider: search failed', err);
      return [];
    }
  },
};
