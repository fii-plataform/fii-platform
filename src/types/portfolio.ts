/**
 * User-owned data: everything here lives in LocalStorage today and is shaped
 * so it can be pushed to a real database (Supabase/Firebase) later without
 * changing the type contract the rest of the app relies on.
 */

export interface PortfolioPosition {
  id: string; // uuid, stable even if ticker is renamed
  ticker: string;
  quantity: number;
  averagePrice: number;
  purchaseDate: string; // ISO date
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteEntry {
  ticker: string;
  addedAt: string;
}

export interface ManualFIIOverride {
  ticker: string;
  /** Any field the user fills in by hand when no API has it. Partial —
   * merged on top of whatever DataService resolves from other providers. */
  data: Record<string, unknown>;
  updatedAt: string;
}

export interface UserReportLink {
  ticker: string;
  pdfUrl: string;
  addedAt: string;
}

export interface AppBackup {
  version: 1;
  exportedAt: string;
  positions: PortfolioPosition[];
  favorites: FavoriteEntry[];
  manualOverrides: ManualFIIOverride[];
  reportLinks: UserReportLink[];
  settings: {
    theme: 'dark' | 'light';
  };
}
