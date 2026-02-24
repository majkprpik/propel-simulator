import type { Platform } from '@shared/types/database';

export const PLATFORM_PORTS: Record<Platform, number> = {
  facebook: 8801,
  google: 8802,
  tiktok: 8803,
  newsbreak: 8804,
  snapchat: 8805,
  everflow: 8806,
  shopify: 8807,
  clickbank: 8808,
  cake: 8809,
  hasoffers: 8810,
};

export async function everflowFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return platformFetch<T>('everflow', path, options);
}

export async function shopifyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return platformFetch<T>('shopify', path, options);
}

export async function clickbankFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return platformFetch<T>('clickbank', path, options);
}

export async function cakeFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return platformFetch<T>('cake', path, options);
}

export async function hasoffersFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return platformFetch<T>('hasoffers', path, options);
}

function getBaseUrl(platform: Platform): string {
  // Dev mode: use Vite proxy to avoid CORS issues
  if (import.meta.env.DEV) {
    return `/api/${platform}`;
  }
  // Production: use env var override if available
  const envKey = `VITE_${platform.toUpperCase()}_URL`;
  const envUrl = import.meta.env[envKey] as string | undefined;
  if (envUrl) {
    return `${envUrl}/api`;
  }
  // Production fallback to hardcoded localhost ports
  return `http://localhost:${PLATFORM_PORTS[platform]}/api`;
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
  const path = pixelId ? `/events?pixel_id=${pixelId}` : '/events';
  return platformFetch<{ data: unknown[]; total: number }>(platform, path);
}

export function listActiveAds(platform: Platform, status = 'ACTIVE') {
  return platformFetch<{ data: import('@shared/types/database').MockAd[]; total: number }>(
    platform,
    `/ads?status=${status}`
  );
}

async function parseApiResponse<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || `${label} failed: ${res.status}`);
  }
  return res.json();
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
      return parseApiResponse(res, 'Facebook CAPI');
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
      return parseApiResponse(res, 'Google CAPI');
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
      return parseApiResponse(res, 'TikTok CAPI');
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
      return parseApiResponse(res, 'Snapchat CAPI');
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
