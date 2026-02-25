import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listActiveAds, createResource } from '../../lib/api';
import { MockLandingPage } from '../../components/MockLandingPage';
import { SkeletonBlock } from '../../components/feed/SkeletonBlock';
import { useInfiniteFeed } from '../../hooks/useInfiniteFeed';
import type { MockAd } from '@shared/types/database';

function SkeletonVideo() {
  return (
    <div className="relative h-96 rounded-xl bg-gray-800 p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card/20">
          <span className="text-2xl">▶</span>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-16 space-y-2">
        <SkeletonBlock className="h-3 w-24 bg-gray-600" />
        <SkeletonBlock className="h-3 w-48 bg-gray-600" />
        <SkeletonBlock className="h-2 w-32 bg-gray-600" />
      </div>
    </div>
  );
}

function AdVideo({ ad, onClick }: { ad: MockAd; onClick: () => void }) {
  return (
    <div className="relative h-96 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 p-4">
      <div className="absolute right-3 top-3 rounded bg-card/20 px-2 py-0.5 text-xs font-bold text-white">
        Sponsored
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-5xl">🎬</span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <p className="text-sm font-bold text-white">@advertiser</p>
        <p className="text-sm text-white/90">{ad.name}</p>
        <button
          onClick={onClick}
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}

export function TikTokFeed() {
  const [landing, setLanding] = useState<{ ad: MockAd; clickId: string; propelClickId: string | null } | null>(null);

  const ads = useQuery({
    queryKey: ['tiktok', 'active-ads'],
    queryFn: () => listActiveAds('tiktok'),
  });

  const activeAds = ads.data?.data ?? [];

  const { items, sentinelRef } = useInfiniteFeed({
    ads: activeAds,
    batchSize: 8,
    skeletonsPerAd: 3,
    getAdId: (ad) => ad.ad_id,
  });

  async function handleAdClick(ad: MockAd) {
    try {
      const res = await createResource<{ click_id: string }>('tiktok', 'clicks/generate', {
        ad_id: ad.ad_id,
        destination_url: ad.destination_url,
      });
      const clickId = (res.data as any).click_id;

      // Register click in Propel via Vite proxy and capture Propel's click_id from redirect
      let propelClickId: string | null = null;
      if (ad.destination_url) {
        try {
          const redirectorBase = import.meta.env.VITE_PROPEL_REDIRECTOR_URL || 'http://localhost:8790';
          const proxyUrl = ad.destination_url.replace(redirectorBase, '/propel-track');
          const trackRes = await fetch(`${proxyUrl}?ttclid=${encodeURIComponent(clickId)}`);
          const location = trackRes.headers.get('X-Redirect-Location') || '';
          const locationUrl = new URL(location, window.location.origin);
          propelClickId = locationUrl.searchParams.get('aff_sub')
            || locationUrl.searchParams.get('click_id')
            || null;
        } catch {}
      }

      setLanding({ ad, clickId, propelClickId });
    } catch {
      setLanding({ ad, clickId: 'click_error', propelClickId: null });
    }
  }

  if (landing) {
    return (
      <MockLandingPage
        ad={landing.ad}
        clickId={landing.clickId}
        propelClickId={landing.propelClickId}
        platform="tiktok"
        platformColor="#00F2EA"
        onBack={() => setLanding(null)}
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">For You</h1>
      <div className="mx-auto max-w-sm space-y-4">
        {ads.isError ? (
          <div className="rounded-lg border border bg-card p-8 text-center">
            <p className="text-sm text-destructive">Failed to load ads: {(ads.error as Error)?.message}</p>
          </div>
        ) : activeAds.length === 0 && !ads.isLoading && (
          <div className="rounded-lg border border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No active ads. Create ads in the <a href="/tiktok/ads" className="text-primary hover:underline">Ads page</a> to see them here.</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id}>
            {item.type === 'skeleton' ? (
              <SkeletonVideo />
            ) : item.data ? (
              <AdVideo ad={item.data} onClick={() => handleAdClick(item.data!)} />
            ) : null}
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
      </div>
    </div>
  );
}
