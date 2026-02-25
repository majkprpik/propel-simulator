import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listActiveAds, createResource } from '../../lib/api';
import { MockLandingPage } from '../../components/MockLandingPage';
import { SkeletonBlock } from '../../components/feed/SkeletonBlock';
import { useInfiniteFeed } from '../../hooks/useInfiniteFeed';
import type { MockAd } from '@shared/types/database';

function SkeletonPost() {
  return (
    <div className="rounded-lg border border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <SkeletonBlock className="mb-1 h-3 w-32" />
          <SkeletonBlock className="h-2 w-20" />
        </div>
      </div>
      <SkeletonBlock className="mb-2 h-3 w-full" />
      <SkeletonBlock className="mb-3 h-3 w-3/4" />
      <SkeletonBlock className="h-48 w-full rounded" />
    </div>
  );
}

function AdPost({ ad, onClick }: { ad: MockAd; onClick: () => void }) {
  return (
    <div className="rounded-lg border border bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          Ad
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{ad.name}</p>
          <p className="text-xs text-muted-foreground">Sponsored</p>
        </div>
      </div>
      <p className="mb-3 text-sm text-card-foreground">
        {ad.destination_url || 'Check out this amazing offer!'}
      </p>
      <div className="mb-3 flex h-48 items-center justify-center rounded bg-gradient-to-br from-blue-50 to-blue-100">
        <span className="text-4xl">🛍️</span>
      </div>
      <button
        onClick={onClick}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
      >
        Learn More
      </button>
    </div>
  );
}

export function FacebookFeed() {
  const [landing, setLanding] = useState<{ ad: MockAd; clickId: string; propelClickId: string | null } | null>(null);

  const ads = useQuery({
    queryKey: ['facebook', 'active-ads'],
    queryFn: () => listActiveAds('facebook'),
  });

  const activeAds = ads.data?.data ?? [];

  const { items, sentinelRef } = useInfiniteFeed({
    ads: activeAds,
    batchSize: 12,
    skeletonsPerAd: 2,
    getAdId: (ad) => ad.ad_id,
  });

  async function handleAdClick(ad: MockAd) {
    try {
      const res = await createResource<{ click_id: string }>('facebook', 'clicks/generate', {
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
          const trackRes = await fetch(`${proxyUrl}?fbclid=${encodeURIComponent(clickId)}`);
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
        platform="facebook"
        platformColor="#1877F2"
        onBack={() => setLanding(null)}
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Feed</h1>
      <div className="mx-auto max-w-xl space-y-4">
        {ads.isError ? (
          <div className="rounded-lg border border bg-card p-8 text-center">
            <p className="text-sm text-destructive">Failed to load ads: {(ads.error as Error)?.message}</p>
          </div>
        ) : activeAds.length === 0 && !ads.isLoading && (
          <div className="rounded-lg border border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No active ads. Create ads in the <a href="/facebook/ads" className="text-primary hover:underline">Ads page</a> to see them here.</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id}>
            {item.type === 'skeleton' ? (
              <SkeletonPost />
            ) : item.data ? (
              <AdPost ad={item.data} onClick={() => handleAdClick(item.data!)} />
            ) : null}
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
      </div>
    </div>
  );
}
