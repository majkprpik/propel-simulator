import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listActiveAds, createResource } from '../../lib/api';
import { MockLandingPage } from '../../components/MockLandingPage';
import { SkeletonBlock } from '../../components/feed/SkeletonBlock';
import { useInfiniteFeed } from '../../hooks/useInfiniteFeed';
import type { MockAd } from '@shared/types/database';

function SkeletonArticle() {
  return (
    <div className="flex gap-4 rounded-lg border border bg-card p-4">
      <SkeletonBlock className="h-20 w-20 flex-shrink-0 rounded" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function AdArticle({ ad, onClick }: { ad: MockAd; onClick: () => void }) {
  return (
    <div className="flex gap-4 rounded-lg border border bg-card p-4 shadow-sm">
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-red-50 to-red-100">
        <span className="text-2xl">📢</span>
      </div>
      <div className="flex-1">
        <span className="mb-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
          Sponsored
        </span>
        <p className="mb-1 text-sm font-semibold text-foreground">{ad.name}</p>
        <p className="mb-2 text-xs text-muted-foreground">{ad.destination_url || 'advertiser.com'}</p>
        <button
          onClick={onClick}
          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90"
        >
          Read More
        </button>
      </div>
    </div>
  );
}

export function NewsBreakFeed() {
  const [landing, setLanding] = useState<{ ad: MockAd; clickId: string } | null>(null);

  const ads = useQuery({
    queryKey: ['newsbreak', 'active-ads'],
    queryFn: () => listActiveAds('newsbreak'),
  });

  const activeAds = ads.data?.data ?? [];

  const { items, sentinelRef } = useInfiniteFeed({
    ads: activeAds,
    batchSize: 10,
    skeletonsPerAd: 2,
    getAdId: (ad) => ad.ad_id,
  });

  async function handleAdClick(ad: MockAd) {
    try {
      const res = await createResource<{ click_id: string }>('newsbreak', 'clicks/generate', {
        ad_id: ad.ad_id,
        destination_url: ad.destination_url,
      });
      setLanding({ ad, clickId: (res.data as any).click_id });
    } catch {
      setLanding({ ad, clickId: 'click_error' });
    }
  }

  if (landing) {
    return (
      <MockLandingPage
        ad={landing.ad}
        clickId={landing.clickId}
        platform="newsbreak"
        platformColor="#E53E3E"
        onBack={() => setLanding(null)}
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Feed</h1>
      <div className="mx-auto max-w-2xl space-y-3">
        {ads.isError ? (
          <div className="rounded-lg border border bg-card p-8 text-center">
            <p className="text-sm text-destructive">Failed to load ads: {(ads.error as Error)?.message}</p>
          </div>
        ) : activeAds.length === 0 && !ads.isLoading && (
          <div className="rounded-lg border border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No active ads. Create ads in the <a href="/newsbreak/ads" className="text-primary hover:underline">Ads page</a> to see them here.</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id}>
            {item.type === 'skeleton' ? (
              <SkeletonArticle />
            ) : item.data ? (
              <AdArticle ad={item.data} onClick={() => handleAdClick(item.data!)} />
            ) : null}
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
      </div>
    </div>
  );
}
