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
  const [landing, setLanding] = useState<{ ad: MockAd; clickId: string } | null>(null);

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

      // Register click in Propel (fire and forget)
      if (ad.destination_url) {
        fetch(`${ad.destination_url}?fbclid=${encodeURIComponent(clickId)}`, { redirect: 'manual' })
          .catch(() => {});
      }

      setLanding({ ad, clickId });
    } catch {
      setLanding({ ad, clickId: 'click_error' });
    }
  }

  if (landing) {
    return (
      <MockLandingPage
        ad={landing.ad}
        clickId={landing.clickId}
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
        {activeAds.length === 0 && !ads.isLoading && (
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
