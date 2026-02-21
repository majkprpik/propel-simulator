import { useState, useEffect, useCallback, useRef } from 'react';

export interface FeedItem<T> {
  type: 'ad' | 'skeleton';
  data?: T;
  id: string;
}

interface UseInfiniteFeedOptions<T> {
  /** Real ads to recycle through the feed */
  ads: T[];
  /** Number of items to load per batch */
  batchSize?: number;
  /** Pattern: how many skeletons between each ad */
  skeletonsPerAd?: number;
  /** Function to generate unique ID for an ad */
  getAdId: (ad: T) => string;
}

/**
 * Hook to create an infinite scrolling feed that recycles real ads
 * mixed with skeleton posts, without storing endless data.
 */
export function useInfiniteFeed<T>({
  ads,
  batchSize = 10,
  skeletonsPerAd = 2,
  getAdId,
}: UseInfiniteFeedOptions<T>) {
  const [items, setItems] = useState<FeedItem<T>[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const currentIndexRef = useRef(0);
  const adCycleIndexRef = useRef(0);

  // Initialize with first batch
  useEffect(() => {
    if (ads.length > 0 && items.length === 0) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads]);

  const generateNextItem = useCallback((): FeedItem<T> => {
    const itemsPerCycle = skeletonsPerAd + 1; // skeletons + 1 ad
    const positionInCycle = currentIndexRef.current % itemsPerCycle;

    currentIndexRef.current++;

    // Generate skeleton posts
    if (positionInCycle < skeletonsPerAd) {
      return {
        type: 'skeleton',
        id: `skeleton-${currentIndexRef.current}`,
      };
    }

    // Generate ad post (cycle through available ads)
    if (ads.length === 0) {
      return {
        type: 'skeleton',
        id: `skeleton-${currentIndexRef.current}`,
      };
    }

    const ad = ads[adCycleIndexRef.current % ads.length];
    adCycleIndexRef.current++;

    return {
      type: 'ad',
      data: ad,
      id: `ad-${getAdId(ad)}-${adCycleIndexRef.current}`,
    };
  }, [ads, skeletonsPerAd, getAdId]);

  const loadMore = useCallback(() => {
    const newItems: FeedItem<T>[] = [];
    for (let i = 0; i < batchSize; i++) {
      newItems.push(generateNextItem());
    }
    setItems(prev => [...prev, ...newItems]);
  }, [batchSize, generateNextItem]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      observerRef.current.observe(node);
    },
    [hasMore, loadMore]
  );

  return {
    items,
    loadMore,
    hasMore,
    sentinelRef,
  };
}
