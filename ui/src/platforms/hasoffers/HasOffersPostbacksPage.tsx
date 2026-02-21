import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasoffersFetch } from '../../lib/api';
import type { HoPostback } from '@shared/types/database';

export function HasOffersPostbacksPage() {
  const qc = useQueryClient();

  const postbacks = useQuery({
    queryKey: ['hasoffers', 'postbacks'],
    queryFn: () => hasoffersFetch<{ data: HoPostback[]; total: number }>('/api/postbacks'),
    refetchInterval: 3000,
  });

  const clearAll = useMutation({
    mutationFn: () => hasoffersFetch('/api/postbacks', { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hasoffers', 'postbacks'] }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Postbacks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Conversion notifications received from Propel. Auto-refreshes every 3s.</p>
        </div>
        <button
          onClick={() => { if (confirm('Clear all postbacks?')) clearAll.mutate(); }}
          disabled={clearAll.isPending || (postbacks.data?.total ?? 0) === 0}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          Clear All
        </button>
      </div>

      {postbacks.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : postbacks.isError ? (
        <p className="text-sm text-destructive">Failed to load: {postbacks.error?.message}</p>
      ) : (postbacks.data?.total ?? 0) === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No postbacks received yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Propel will send <code className="rounded bg-muted px-1">GET /aff_lsr.php?transaction_id=...</code> here after a conversion.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Transaction ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Offer ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payout</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Matched</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Received At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(postbacks.data?.data ?? []).map((pb) => (
                <tr key={pb.id} className={`hover:bg-muted/30 ${pb.click_matched ? 'bg-green-50/30' : 'bg-yellow-50/30'}`}>
                  <td className="px-4 py-3 font-mono text-xs">{pb.transaction_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{pb.offer_id ?? '—'}</td>
                  <td className="px-4 py-3">{pb.payout != null ? `$${Number(pb.payout).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pb.click_matched ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {pb.click_matched ? 'Matched' : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(pb.received_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(postbacks.data?.total ?? 0) > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Total: {postbacks.data?.total} postback{(postbacks.data?.total ?? 0) !== 1 ? 's' : ''}.
          Green = transaction_id matched a known click. Yellow = unknown transaction_id.
        </p>
      )}
    </div>
  );
}
