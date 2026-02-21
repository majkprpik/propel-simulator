import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../lib/api';
import { StatsCard } from '../components/StatsCard';
import type { Platform } from '@shared/types/database';

const platforms: { name: string; key: Platform; color: string }[] = [
  { name: 'Facebook', key: 'facebook', color: '#1877F2' },
  { name: 'Google', key: 'google', color: '#4285F4' },
  { name: 'TikTok', key: 'tiktok', color: '#00F2EA' },
  { name: 'NewsBreak', key: 'newsbreak', color: '#E53E3E' },
  { name: 'Snapchat', key: 'snapchat', color: '#FFFC00' },
];

export function AdminOverview() {
  const queries = platforms.map((p) => ({
    ...p,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    query: useQuery({
      queryKey: [p.key, 'events'],
      queryFn: () => getEvents(p.key),
    }),
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Overview</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {queries.map((p) => (
          <div key={p.key} className="relative">
            <div
              className="absolute left-0 top-0 h-1 w-full rounded-t-lg"
              style={{ backgroundColor: p.color }}
            />
            <StatsCard
              label={`${p.name} Events`}
              value={p.query.data?.total ?? 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
