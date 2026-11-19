export function messageError(error: unknown, fallback: string) {
  if (typeof error !== 'object' || !error || !('data' in error)) return fallback;
  const data = error.data;
  if (typeof data === 'object' && data && 'message' in data && typeof data.message === 'string') {
    return data.message === 'File too large' ? 'Videos must be 50 MB or smaller; images must be 10 MB or smaller.' : data.message;
  }
  return fallback;
}
