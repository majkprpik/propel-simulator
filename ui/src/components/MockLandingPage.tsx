import { useState } from 'react';
import { sendConversionEvent, listResource } from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import type { Platform, MockPixel } from '@shared/types/database';

interface MockLandingPageProps {
  platform: Platform;
  ad: { ad_id: string; name: string; destination_url: string | null };
  clickId: string;
  propelClickId?: string | null;
  platformColor: string;
  onBack: () => void;
}

const CONVERSION_ACTIONS = [
  { name: 'Purchase', value: 99.99, currency: 'USD' },
  { name: 'AddToCart', value: 29.99, currency: 'USD' },
  { name: 'Lead' },
  { name: 'CompleteRegistration' },
];

export function MockLandingPage({ platform, ad, clickId, propelClickId, platformColor, onBack }: MockLandingPageProps) {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const pixels = useQuery({
    queryKey: [platform, 'pixels'],
    queryFn: () => listResource<MockPixel>(platform, 'pixels'),
  });

  const pixelList = pixels.data?.data ?? [];
  const hasPixels = pixelList.length > 0;

  async function handleConversion(action: typeof CONVERSION_ACTIONS[number]) {
    if (!hasPixels) return;
    const pixel = pixelList[0];
    setStatus({ type: 'loading' });
    try {
      await sendConversionEvent({
        platform,
        pixel: { pixel_id: pixel.pixel_id, access_token: pixel.access_token, ad_account_id: pixel.ad_account_id },
        clickId,
        eventName: action.name,
        value: action.value,
        currency: action.currency,
      });

      // Send conversion to Propel postback-handler (fire and forget)
      const postbackClickId = propelClickId || clickId;
      const params = new URLSearchParams({ click_id: postbackClickId });
      if (action.value != null) params.set('payout', String(action.value));
      fetch(`http://localhost:8789/postback?${params}`, { method: 'GET' }).catch(() => {});

      setStatus({ type: 'success', message: `${action.name} sent to simulator + Propel!` });
      setTimeout(() => setStatus({ type: 'idle' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to send event' });
      setTimeout(() => setStatus({ type: 'idle' }), 4000);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        &larr; Back to Feed
      </button>

      <div className="overflow-hidden rounded-lg border border bg-card shadow-sm">
        <div className="p-1" style={{ backgroundColor: platformColor, opacity: 0.15 }}>
          <div className="h-1" />
        </div>
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground">{ad.name}</h1>
          {ad.destination_url && (
            <p className="mt-1 text-sm text-muted-foreground">{ad.destination_url}</p>
          )}
          <div className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p><span className="font-medium">Ad ID:</span> {ad.ad_id}</p>
            <p><span className="font-medium">Click ID:</span> {clickId}</p>
            <p><span className="font-medium">Platform:</span> {platform}</p>
          </div>
        </div>

        <div className="border-t border p-6">
          <h2 className="mb-3 text-sm font-semibold text-card-foreground">Trigger Conversion Event</h2>
          {!hasPixels && (
            <p className="mb-3 rounded-md bg-amber-500/10 p-3 text-sm text-amber-500">
              No pixels configured. Create a pixel first to fire conversion events.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {CONVERSION_ACTIONS.map((action) => (
              <button
                key={action.name}
                onClick={() => handleConversion(action)}
                disabled={!hasPixels || status.type === 'loading'}
                className="rounded-md border border px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {action.name}
                {action.value != null && (
                  <span className="ml-1 text-xs text-muted-foreground">${action.value}</span>
                )}
              </button>
            ))}
          </div>
          {status.type === 'success' && (
            <p className="mt-3 rounded-md bg-green-500/10 p-2 text-center text-sm text-green-500">{status.message}</p>
          )}
          {status.type === 'error' && (
            <p className="mt-3 rounded-md bg-red-500/10 p-2 text-center text-sm text-red-500">{status.message}</p>
          )}
          {status.type === 'loading' && (
            <p className="mt-3 text-center text-sm text-muted-foreground">Sending event...</p>
          )}
        </div>
      </div>
    </div>
  );
}
