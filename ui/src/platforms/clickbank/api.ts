import { PLATFORM_PORTS } from '../../lib/api';

export async function clickbankFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const base = import.meta.env.DEV ? '/api/clickbank' : `http://localhost:${PLATFORM_PORTS['clickbank']}`;
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((error as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return res.json();
}
