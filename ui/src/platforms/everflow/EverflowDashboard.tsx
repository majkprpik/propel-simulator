import { useQuery } from '@tanstack/react-query';
import { everflowFetch } from '../../lib/api';
import { StatsCard } from '../../components/StatsCard';
import type { EfOffer, EfPostback } from '@shared/types/database';

export function EverflowDashboard() {
  const offers = useQuery({
    queryKey: ['everflow', 'offers'],
    queryFn: () => everflowFetch<{ data: EfOffer[]; total: number }>('/api/offers'),
  });

  const clicks = useQuery({
    queryKey: ['everflow', 'clicks'],
    queryFn: () => everflowFetch<{ data: unknown[]; total: number }>('/api/clicks'),
  });

  const postbacks = useQuery({
    queryKey: ['everflow', 'postbacks'],
    queryFn: () => everflowFetch<{ data: EfPostback[]; total: number }>('/api/postbacks'),
    refetchInterval: 5000,
  });

  const totalPayout = (postbacks.data?.data ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const pendingClicks = (clicks.data?.data ?? []).filter((c: unknown) => !(c as { converted?: boolean }).converted).length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Everflow Dashboard</h1>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Offers" value={offers.data?.total ?? 0} />
        <StatsCard label="Pending Clicks" value={pendingClicks} />
        <StatsCard label="Conversions Received" value={postbacks.data?.total ?? 0} />
        <StatsCard label="Total Payout" value={`$${totalPayout.toFixed(2)}`} />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Postbacks</h2>
      {postbacks.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : postbacks.data?.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No postbacks received yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Transaction ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Offer ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Matched</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Received At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(postbacks.data?.data ?? []).slice(0, 20).map((pb) => (
                <tr key={pb.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{pb.transaction_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{pb.offer_id ?? '—'}</td>
                  <td className="px-4 py-3">{pb.amount != null ? `$${Number(pb.amount).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pb.click_matched ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {pb.click_matched ? 'Yes' : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(pb.received_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
