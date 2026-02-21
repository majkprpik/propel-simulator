import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformFetch } from '../lib/api';
import { StatsCard } from '../components/StatsCard';
import type { Platform } from '@shared/types/database';

const tables = [
  { name: 'mock_ad_accounts', label: 'Ad Accounts' },
  { name: 'mock_campaigns', label: 'Campaigns' },
  { name: 'mock_ad_groups', label: 'Ad Groups' },
  { name: 'mock_ads', label: 'Ads' },
  { name: 'mock_pixels', label: 'Pixels' },
  { name: 'mock_events', label: 'Events' },
  { name: 'mock_clicks', label: 'Clicks' },
  { name: 'mock_postback_configs', label: 'Postback Configs' },
];

const platforms: Platform[] = ['facebook', 'google', 'tiktok', 'newsbreak', 'snapchat'];

export function DatabasePage() {
  const queryClient = useQueryClient();

  const counts = useQuery({
    queryKey: ['admin', 'db-counts'],
    queryFn: async () => {
      const results: Record<string, number> = {};
      for (const resource of ['accounts', 'campaigns', 'ad-groups', 'pixels', 'events', 'clicks']) {
        let total = 0;
        for (const p of platforms) {
          try {
            const res = await platformFetch<{ total: number }>(p, `/${resource}`);
            total += res.total ?? 0;
          } catch {
            // worker not running
          }
        }
        results[resource] = total;
      }
      return results;
    },
  });

  const reset = useMutation({
    mutationFn: async () => {
      for (const p of platforms) {
        try {
          await platformFetch(p, '/test/reset', { method: 'POST' });
        } catch {
          // worker not running
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Database</h1>
        <button
          onClick={() => {
            if (window.confirm('This will reset all mock data across all platforms. Continue?')) {
              reset.mutate();
            }
          }}
          disabled={reset.isPending}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {reset.isPending ? 'Resetting...' : 'Reset All Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tables.map((t) => {
          const key = t.name.replace('mock_', '').replace('_', '-');
          const mapped: Record<string, string> = {
            'ad-accounts': 'accounts',
            'campaigns': 'campaigns',
            'ad-groups': 'ad-groups',
            'ads': 'ads',
            'pixels': 'pixels',
            'events': 'events',
            'clicks': 'clicks',
            'postback-configs': 'postback-configs',
          };
          return (
            <StatsCard
              key={t.name}
              label={t.label}
              value={counts.data?.[mapped[key] ?? key] ?? '-'}
            />
          );
        })}
      </div>
    </div>
  );
}
