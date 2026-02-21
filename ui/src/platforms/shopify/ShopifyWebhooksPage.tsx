import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopifyFetch } from '../../lib/api';
import type { ShopifyWebhookLog } from '@shared/types/database';

export function ShopifyWebhooksPage() {
  const qc = useQueryClient();

  const webhookLog = useQuery({
    queryKey: ['shopify', 'webhook-log'],
    queryFn: () => shopifyFetch<{ data: ShopifyWebhookLog[]; total: number }>('/api/webhook-log'),
    refetchInterval: 3000,
  });

  const clearAll = useMutation({
    mutationFn: () => shopifyFetch('/api/webhook-log', { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopify', 'webhook-log'] }),
  });

  const entries = webhookLog.data?.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Webhook Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fired webhook history. Auto-refreshes every 3s.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Clear all webhook log entries?')) clearAll.mutate();
          }}
          disabled={clearAll.isPending || entries.length === 0}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          Clear All
        </button>
      </div>

      {webhookLog.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : webhookLog.isError ? (
        <p className="text-sm text-destructive">Failed to load: {webhookLog.error?.message}</p>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No webhooks fired yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Go to the Orders page and use the "Fire Webhook" button to send a test webhook.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Shop</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Topic</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Target URL</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fired At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-muted/30 ${
                    entry.response_status != null && entry.response_status >= 200 && entry.response_status < 300
                      ? 'bg-green-50/30'
                      : 'bg-red-50/30'
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs">{entry.order_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.shop_domain ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{entry.topic}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" title={entry.target_url}>
                    {entry.target_url.length > 40
                      ? entry.target_url.slice(0, 40) + '...'
                      : entry.target_url}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.response_status != null && entry.response_status >= 200 && entry.response_status < 300
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {entry.response_status || 'Error'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(entry.fired_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Total: {entries.length} webhook{entries.length !== 1 ? 's' : ''} logged. Green = 2xx
          response. Red = error.
        </p>
      )}
    </div>
  );
}
