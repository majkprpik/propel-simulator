import type { Platform } from '@shared/types/database';

const PLATFORM_PORTS: Partial<Record<Platform, number>> = {
  facebook: 8801,
  google: 8802,
  tiktok: 8803,
  newsbreak: 8804,
  snapchat: 8805,
};

const EVERFLOW_PORT = 8806;
const SHOPIFY_PORT = 8807;
const CLICKBANK_PORT = 8808;
const CAKE_PORT = 8809;
const HASOFFERS_PORT = 8810;

function getEverflowBaseUrl(): string {
  if (import.meta.env.DEV) return '/api/everflow';
  return `http://localhost:${EVERFLOW_PORT}`;
}

function getShopifyBaseUrl(): string {
  if (import.meta.env.DEV) return '/api/shopify';
  return `http://localhost:${SHOPIFY_PORT}`;
}

function getClickBankBaseUrl(): string {
  if (import.meta.env.DEV) return '/api/clickbank';
  return `http://localhost:${CLICKBANK_PORT}`;
}

function getCakeBaseUrl(): string {
  if (import.meta.env.DEV) return '/api/cake';
  return `http://localhost:${CAKE_PORT}`;
}

function getHasOffersBaseUrl(): string {
  if (import.meta.env.DEV) return '/api/hasoffers';
  return `http://localhost:${HASOFFERS_PORT}`;
}

async function fetchHelper<T>(baseUrl: string, path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((error as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function everflowFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return fetchHelper<T>(getEverflowBaseUrl(), path, options);
}

export async function shopifyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return fetchHelper<T>(getShopifyBaseUrl(), path, options);
}

export async function clickbankFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return fetchHelper<T>(getClickBankBaseUrl(), path, options);
}

export async function cakeFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return fetchHelper<T>(getCakeBaseUrl(), path, options);
}

export async function hasoffersFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return fetchHelper<T>(getHasOffersBaseUrl(), path, options);
}

function getBaseUrl(platform: Platform): string {
  // In dev, use Vite proxy
  if (import.meta.env.DEV) {
    return `/api/${platform}`;
  }
  const port = PLATFORM_PORTS[platform];
  if (port == null) throw new Error(`No port configured for platform: ${platform}`);
  return `http://localhost:${port}/api`;
}

export async function platformFetch<T>(
  platform: Platform,
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${getBaseUrl(platform)}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// CRUD helpers
export function listResource<T>(platform: Platform, resource: string) {
  return platformFetch<{ data: T[]; total: number }>(platform, `/${resource}`);
}

export function createResource<T>(platform: Platform, resource: string, body: Record<string, unknown>) {
  return platformFetch<{ data: T }>(platform, `/${resource}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getEvents(platform: Platform, pixelId?: string) {
  const path = pixelId ? `/events/${pixelId}` : '/events';
  return platformFetch<{ data: unknown[]; total: number }>(platform, path);
}

export function listActiveAds(platform: Platform) {
  return platformFetch<{ data: import('@shared/types/database').MockAd[]; total: number }>(
    platform,
    '/ads?status=ACTIVE'
  );
}

export async function sendConversionEvent({
  platform,
  pixel,
  clickId,
  eventName,
  value,
  currency,
}: {
  platform: Platform;
  pixel: { pixel_id: string; access_token: string | null; ad_account_id: string };
  clickId: string;
  eventName: string;
  value?: number;
  currency?: string;
}) {
  const now = Math.floor(Date.now() / 1000);

  switch (platform) {
    case 'facebook': {
      const capiUrl = `/capi/facebook/v18.0/${pixel.pixel_id}/events`;
      const res = await fetch(capiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName,
              event_time: now,
              event_id: crypto.randomUUID(),
              action_source: 'website',
              user_data: { fbc: clickId },
              custom_data: value != null ? { value, currency: currency || 'USD' } : undefined,
            },
          ],
          access_token: pixel.access_token,
        }),
      });
      return res.json();
    }

    case 'google': {
      const accountId = pixel.ad_account_id || 'unknown';
      const capiUrl = `/capi/google/v17/customers/${accountId}:uploadClickConversions`;
      const res = await fetch(capiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pixel.access_token || 'mock-token'}`,
          'developer-token': 'mock-developer-token',
        },
        body: JSON.stringify({
          conversions: [
            {
              conversionAction: pixel.pixel_id,
              gclid: clickId,
              conversionValue: value,
              conversionDateTime: new Date().toISOString(),
              currencyCode: currency || 'USD',
            },
          ],
        }),
      });
      return res.json();
    }

    case 'tiktok': {
      const capiUrl = `/capi/tiktok/open_api/v1.3/event/track/`;
      const res = await fetch(capiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': pixel.access_token || 'mock-token',
        },
        body: JSON.stringify({
          pixel_id: pixel.pixel_id,
          data: [
            {
              event_name: eventName,
              event_id: crypto.randomUUID(),
              timestamp: now,
              user_data: { ttclid: clickId },
              properties: value != null ? { value, currency: currency || 'USD' } : undefined,
            },
          ],
        }),
      });
      return res.json();
    }

    case 'snapchat': {
      const capiUrl = `/capi/snapchat/v2/conversion`;
      const res = await fetch(capiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pixel.access_token || 'mock-token'}`,
        },
        body: JSON.stringify({
          pixel_id: pixel.pixel_id,
          event: eventName,
          timestamp: now,
          click_id: clickId,
          price: value != null ? String(value) : undefined,
          currency: currency || 'USD',
        }),
      });
      return res.json();
    }

    case 'newsbreak': {
      return platformFetch(platform, '/events', {
        method: 'POST',
        body: JSON.stringify({
          pixel_id: pixel.pixel_id,
          event_name: eventName,
          event_time: now,
          click_id: clickId,
          value: value ?? null,
          currency: currency || 'USD',
        }),
      });
    }

    default:
      throw new Error(`Conversion tracking not supported for platform: ${platform}`);
  }
}
