import { STORAGE_KEYS } from '@/config/constants';
import type { PortfolioPosition, FavoriteEntry, ManualFIIOverride, UserReportLink, AppBackup } from '@/types/portfolio';

/**
 * StorageService centralizes every read/write to LocalStorage.
 *
 * Why this matters for scalability: nothing else in the app talks to
 * `window.localStorage` directly. When it's time to move to Supabase or
 * Firebase, only this file needs to change — every hook/page keeps calling
 * `StorageService.getPositions()` etc. and the async signatures already in
 * place here (all return values are already plain objects, easy to wrap in
 * Promises) make that swap mechanical rather than a rewrite.
 */

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`StorageService: failed to write key "${key}"`, err);
  }
}

export const StorageService = {
  // ---- Portfolio positions ----
  getPositions(): PortfolioPosition[] {
    return read(STORAGE_KEYS.positions, []);
  },
  savePositions(positions: PortfolioPosition[]): void {
    write(STORAGE_KEYS.positions, positions);
  },

  // ---- Favorites ----
  getFavorites(): FavoriteEntry[] {
    return read(STORAGE_KEYS.favorites, []);
  },
  saveFavorites(favorites: FavoriteEntry[]): void {
    write(STORAGE_KEYS.favorites, favorites);
  },

  // ---- Manual overrides (user-entered data used when no API covers a field) ----
  getManualOverrides(): ManualFIIOverride[] {
    return read(STORAGE_KEYS.manualOverrides, []);
  },
  saveManualOverrides(overrides: ManualFIIOverride[]): void {
    write(STORAGE_KEYS.manualOverrides, overrides);
  },

  // ---- Report links (PDF URLs used by the AI summary feature) ----
  getReportLinks(): UserReportLink[] {
    return read(STORAGE_KEYS.reportLinks, []);
  },
  saveReportLinks(links: UserReportLink[]): void {
    write(STORAGE_KEYS.reportLinks, links);
  },

  // ---- Secrets (kept in LocalStorage only, never sent anywhere but the
  // respective API's own endpoint, never bundled into source) ----
  getBrapiToken(): string {
    return localStorage.getItem(STORAGE_KEYS.brapiToken) ?? '';
  },
  setBrapiToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.brapiToken, token);
  },
  getOpenRouterKey(): string {
    return localStorage.getItem(STORAGE_KEYS.openRouterKey) ?? '';
  },
  setOpenRouterKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.openRouterKey, key);
  },

  // ---- Theme ----
  getTheme(): 'dark' | 'light' {
    return (localStorage.getItem(STORAGE_KEYS.theme) as 'dark' | 'light') ?? 'dark';
  },
  setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  },

  // ---- Quote/FII cache (short-TTL cache to avoid hammering BRAPI) ----
  getCachedFII<T>(ticker: string): { data: T; cachedAt: number } | null {
    return read<{ data: T; cachedAt: number } | null>(`${STORAGE_KEYS.fiiCache}${ticker}`, null);
  },
  setCachedFII<T>(ticker: string, data: T): void {
    write(`${STORAGE_KEYS.fiiCache}${ticker}`, { data, cachedAt: Date.now() });
  },

  // ---- Backup / restore ----
  exportBackup(): AppBackup {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      positions: this.getPositions(),
      favorites: this.getFavorites(),
      manualOverrides: this.getManualOverrides(),
      reportLinks: this.getReportLinks(),
      settings: { theme: this.getTheme() },
    };
  },
  importBackup(backup: AppBackup): void {
    this.savePositions(backup.positions ?? []);
    this.saveFavorites(backup.favorites ?? []);
    this.saveManualOverrides(backup.manualOverrides ?? []);
    this.saveReportLinks(backup.reportLinks ?? []);
    if (backup.settings?.theme) this.setTheme(backup.settings.theme);
  },
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key.endsWith(':')) return; // prefix keys (cache) handled separately
      localStorage.removeItem(key);
    });
  },
};
