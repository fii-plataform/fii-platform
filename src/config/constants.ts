export const STORAGE_KEYS = {
  positions: 'fii:positions',
  favorites: 'fii:favorites',
  manualOverrides: 'fii:manualOverrides',
  reportLinks: 'fii:reportLinks',
  settings: 'fii:settings',
  brapiToken: 'fii:secrets:brapiToken',
  openRouterKey: 'fii:secrets:openRouterKey',
  fiiCache: 'fii:cache:', // + ticker
  theme: 'fii:theme',
} as const;

export const BRAPI_BASE_URL = 'https://brapi.dev/api';

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Default model used for report summarization. Configurable later from Settings if desired.
export const OPENROUTER_DEFAULT_MODEL = 'openai/gpt-4o-mini';

// How long cached quote data is considered fresh before re-fetching (ms).
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const APP_NAME = 'FII Terminal';
