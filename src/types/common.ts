export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

/** Generic result wrapper so DataService can report which provider answered,
 * without ever throwing and breaking the UI. */
export interface DataResult<T> {
  data: T | null;
  source: 'brapi' | 'manual' | 'cache' | 'unavailable';
  error?: string;
}
