import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listActiveAds, createResource } from '../../lib/api';
import { MockLandingPage } from '../../components/MockLandingPage';
import { SkeletonBlock } from '../../components/feed/SkeletonBlock';
import { useInfiniteFeed } from '../../hooks/useInfiniteFeed';
import type { MockAd } from '@shared/types/database';

function SkeletonResult() {
  return (
    <div className="mb-6">
      <SkeletonBlock className="mb-1 h-3 w-48" />
      <SkeletonBlock className="mb-1 h-5 w-80" />
      <SkeletonBlock className="mb-1 h-3 w-full" />
      <SkeletonBlock className="h-3 w-3/4" />
    </div>
  );
}

function AdResult({ ad, onClick }: { ad: MockAd; onClick: () => void }) {
  return (
    <div className="mb-6 rounded-lg border border-gray-100 bg-card p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">Sponsored</span>
      </div>
      <button onClick={onClick} className="mb-1 block text-left">
        <p className="text-lg text-primary hover:underline">{ad.name}</p>
      </button>
      <p className="mb-1 text-sm text-green-700">{ad.destination_url || 'www.example.com'}</p>
      <p className="text-sm text-muted-foreground">Discover great offers and deals. Click to learn more about this promoted result.</p>
    </div>
  );
}

export function GoogleFeed() {
  const [landing, setLanding] = useState<{ ad: MockAd; clickId: string } | null>(null);
  const [searchQuery] = useState('best products online');

  const ads = useQuery({
    queryKey: ['google', 'active-ads'],
    queryFn: () => listActiveAds('google'),
  });

  const activeAds = ads.data?.data ?? [];

  const { items, sentinelRef } = useInfiniteFeed({
    ads: activeAds,
    batchSize: 10,
    skeletonsPerAd: 3,
    getAdId: (ad) => ad.ad_id,
  });

  async function handleAdClick(ad: MockAd) {
    try {
      const res = await createResource<{ click_id: string }>('google', 'clicks/generate', {
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
        platform="google"
        platformColor="#4285F4"
        onBack={() => setLanding(null)}
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Search</h1>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center rounded-full border border px-4 py-2 shadow-sm">
          <span className="mr-3 text-muted-foreground">🔍</span>
          <span className="text-sm text-card-foreground">{searchQuery}</span>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">About 1,234,567 results (0.42 seconds)</p>

        {ads.isError ? (
          <div className="mb-6 rounded-lg border border bg-card p-8 text-center">
            <p className="text-sm text-destructive">Failed to load ads: {(ads.error as Error)?.message}</p>
          </div>
        ) : activeAds.length === 0 && !ads.isLoading && (
          <div className="mb-6 rounded-lg border border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No active ads. Create ads in the <a href="/google/ads" className="text-primary hover:underline">Ads page</a> to see them here.</p>
          </div>
        )}

        {items.map((item) => (
          <div key={item.id}>
            {item.type === 'skeleton' ? (
              <SkeletonResult />
            ) : item.data ? (
              <AdResult ad={item.data} onClick={() => handleAdClick(item.data!)} />
            ) : null}
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
      </div>
    </div>
  );
}
