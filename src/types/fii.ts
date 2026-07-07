/**
 * Domain types for a FII (Fundo de Investimento Imobiliário).
 * These are the normalized shapes the whole app consumes, regardless of
 * which upstream provider (BRAPI, manual entry, future API) supplied the data.
 */

export type FIISegment =
  | 'Logístico'
  | 'Shopping'
  | 'Escritórios'
  | 'Papel'
  | 'FoF'
  | 'Híbrido'
  | 'Agro'
  | 'Hospitalar'
  | 'Educacional'
  | 'Outros';

export type FIIType = 'Tijolo' | 'Papel' | 'Híbrido' | 'FoF';

export interface FIIQuote {
  price: number;
  changePercent: number;
  updatedAt: string; // ISO date
}

export interface FIIIndicators {
  dyTwelveMonths: number | null; // %
  pvp: number | null;
  vacanciaFisica: number | null; // %
  vacanciaFinanceira: number | null; // %
  capRate: number | null; // %
  taxaAdministracao: number | null; // %
  wault: number | null; // years
  contratosTipicos: number | null; // %
  contratosAtipicos: number | null; // %
}

export interface FIIDividendEvent {
  referenceMonth: string; // "2026-06"
  paymentDate: string; // ISO date
  valuePerShare: number;
}

export interface FIIProperty {
  name: string;
  city: string;
  state: string;
  segment: FIISegment;
  latitude?: number;
  longitude?: number;
  areaM2?: number;
  occupancyPercent?: number;
}

export interface FIITenant {
  name: string;
  percentOfRevenue?: number;
}

export interface FIIPortfolioInfo {
  propertyCount: number | null;
  properties: FIIProperty[];
  mainTenants: FIITenant[];
}

export interface FIIGeneralInfo {
  name: string;
  ticker: string;
  segment: FIISegment;
  type: FIIType;
  manager: string;
  netWorth: number | null; // Patrimônio Líquido
  shareValue: number | null; // Valor Patrimonial por cota
  liquidityDaily: number | null; // R$ negociado/dia
  shareholderCount: number | null;
}

export interface FIIHistoricalPoint {
  date: string; // ISO date
  price?: number;
  netWorth?: number;
  dy?: number;
}

/** Fully assembled FII record, as consumed by pages/components. */
export interface FII {
  general: FIIGeneralInfo;
  quote: FIIQuote | null;
  indicators: FIIIndicators;
  dividends: FIIDividendEvent[];
  portfolio: FIIPortfolioInfo;
  history: FIIHistoricalPoint[];
  /** Where each part of this record ultimately came from — surfaced in the UI so
   * the person always knows what's live data vs. what they entered manually. */
  source: 'brapi' | 'manual' | 'mixed' | 'unavailable';
  lastUpdated: string; // ISO date
}

export const ALL_SEGMENTS: FIISegment[] = [
  'Logístico',
  'Shopping',
  'Escritórios',
  'Papel',
  'FoF',
  'Híbrido',
  'Agro',
  'Hospitalar',
  'Educacional',
  'Outros',
];

export const SEGMENT_COLOR_KEY: Record<FIISegment, string> = {
  Logístico: 'logistico',
  Shopping: 'shopping',
  Escritórios: 'escritorios',
  Papel: 'papel',
  FoF: 'fof',
  Híbrido: 'hibrido',
  Agro: 'agro',
  Hospitalar: 'hospitalar',
  Educacional: 'educacional',
  Outros: 'papel',
};
