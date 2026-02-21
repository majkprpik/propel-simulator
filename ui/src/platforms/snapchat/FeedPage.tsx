import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listActiveAds, createResource } from '../../lib/api';
import { MockLandingPage } from '../../components/MockLandingPage';
import { SkeletonBlock } from '../../components/feed/SkeletonBlock';
import { useInfiniteFeed } from '../../hooks/useInfiniteFeed';
import type { MockAd } from '@shared/types/database';

const GRADIENTS = [
  'from-purple-400 to-pink-400',
  'from-blue-400 to-cyan-400',
  'from-green-400 to-teal-400',
  'from-orange-400 to-red-400',
  'from-indigo-400 to-purple-400',
  'from-pink-400 to-rose-400',
];

function SkeletonTile({ index }: { index: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  return (
    <div className={`relative h-64 rounded-xl bg-gradient-to-b ${gradient} p-4`}>
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <SkeletonBlock className="h-3 w-24 bg-card/30" />
        <SkeletonBlock className="h-2 w-16 bg-card/20" />
      </div>
    </div>
  );
}

function AdTile({ ad, onClick }: { ad: MockAd; onClick: () => void }) {
  return (
    <div className="relative h-64 rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 p-4">
      <div className="absolute right-3 top-3 rounded bg-black/30 px-2 py-0.5 text-[10px] font-bold text-white">
        Sponsored
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl">✨</span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <p className="text-sm font-bold text-foreground">{ad.name}</p>
        <button
          onClick={onClick}
          className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-black shadow-sm hover:bg-yellow-300"
        >
          Swipe Up
        </button>
      </div>
    </div>
  );
}

export function SnapchatFeed() {
  const [landing, setLanding] = useState<{ ad: MockAd; clickId: string } | null>(null);

  const ads = useQuery({
    queryKey: ['snapchat', 'active-ads'],
    queryFn: () => listActiveAds('snapchat'),
  });

  const activeAds = ads.data?.data ?? [];

  const { items, sentinelRef } = useInfiniteFeed({
    ads: activeAds,
    batchSize: 12,
    skeletonsPerAd: 4,
    getAdId: (ad) => ad.ad_id,
  });

  async function handleAdClick(ad: MockAd) {
    try {
      const res = await createResource<{ click_id: string }>('snapchat', 'clicks/generate', {
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
        platform="snapchat"
        platformColor="#FFFC00"
        onBack={() => setLanding(null)}
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Discover</h1>
      {ads.isError ? (
        <div className="mb-6 rounded-lg border border bg-card p-8 text-center">
          <p className="text-sm text-destructive">Failed to load ads: {(ads.error as Error)?.message}</p>
        </div>
      ) : activeAds.length === 0 && !ads.isLoading && (
        <div className="mb-6 rounded-lg border border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No active ads. Create ads in the <a href="/snapchat/ads" className="text-yellow-600 hover:underline">Ads page</a> to see them here.</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div key={item.id}>
            {item.type === 'skeleton' ? (
              <SkeletonTile index={idx} />
            ) : item.data ? (
              <AdTile ad={item.data} onClick={() => handleAdClick(item.data!)} />
            ) : null}
          </div>
        ))}
        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="col-span-2 h-4" />
      </div>
    </div>
  );
}
