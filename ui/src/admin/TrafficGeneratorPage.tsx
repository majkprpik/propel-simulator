import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listResource, platformFetch } from '../lib/api';
import type { Platform, MockCampaign } from '@shared/types/database';

const platforms: { label: string; value: Platform }[] = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Google', value: 'google' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'NewsBreak', value: 'newsbreak' },
  { label: 'Snapchat', value: 'snapchat' },
];

export function TrafficGenerator() {
  const [platform, setPlatform] = useState<Platform>('facebook');
  const [campaignId, setCampaignId] = useState('');
  const [count, setCount] = useState('10');
  const [result, setResult] = useState<string | null>(null);

  const campaigns = useQuery({
    queryKey: [platform, 'campaigns'],
    queryFn: () => listResource<MockCampaign>(platform, 'campaigns'),
  });

  const generate = useMutation({
    mutationFn: () =>
      platformFetch(platform, '/clicks/generate', {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: campaignId || undefined,
          count: Number(count),
        }),
      }),
    onSuccess: (data) => {
      setResult(`Generated ${(data as { generated: number }).generated ?? count} clicks`);
    },
    onError: (err) => {
      setResult(`Error: ${err.message}`);
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Traffic Generator</h1>
      <div className="max-w-lg rounded-lg border border bg-card p-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-card-foreground">Platform</span>
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value as Platform);
                setCampaignId('');
              }}
              className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-card-foreground">Campaign (optional)</span>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Any / random</option>
              {(campaigns.data?.data ?? []).map((c) => (
                <option key={c.campaign_id} value={c.campaign_id}>
                  {c.name} ({c.campaign_id})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-card-foreground">Number of clicks</span>
            <input
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          <button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {generate.isPending ? 'Generating...' : 'Generate Clicks'}
          </button>

          {result && (
            <p className="rounded bg-muted px-3 py-2 text-sm text-card-foreground">{result}</p>
          )}
        </div>
      </div>
    </div>
  );
}
