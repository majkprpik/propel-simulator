import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '../../components/StatsCard';

async function shopifyFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const base = import.meta.env.DEV ? '/api/shopify' : 'http://localhost:8807';
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

interface Shop {
  id: string;
  shop_domain: string;
  status: string;
}

interface WebhookLogEntry {
  id: string;
  order_id: number;
  shop_domain: string;
  target_url: string;
  topic: string;
  response_status: number;
  response_body: string;
  fired_at: string;
}

export function ShopifyDashboard() {
  const shops = useQuery({
    queryKey: ['shopify', 'shops'],
    queryFn: () => shopifyFetch<{ data: Shop[]; total: number }>('/api/shops'),
  });

  const orders = useQuery({
    queryKey: ['shopify', 'orders'],
    queryFn: () => shopifyFetch<{ data: unknown[]; total: number }>('/api/orders'),
  });

  const webhookLog = useQuery({
    queryKey: ['shopify', 'webhook-log'],
    queryFn: () => shopifyFetch<{ data: WebhookLogEntry[]; total: number }>('/api/webhook-log'),
    refetchInterval: 5000,
  });

  const logEntries = webhookLog.data?.data ?? [];
  const webhooksFired = logEntries.length;
  const failedWebhooks = logEntries.filter(
    (e) => e.response_status !== 200 && e.response_status !== 201
  ).length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Shopify Dashboard</h1>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Shops" value={shops.data?.total ?? 0} />
        <StatsCard label="Total Orders" value={orders.data?.total ?? 0} />
        <StatsCard label="Webhooks Fired" value={webhooksFired} />
        <StatsCard label="Failed Webhooks" value={failedWebhooks} />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Webhook Activity</h2>
      {webhookLog.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : logEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No webhooks fired yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Shop</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Target URL</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fired At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logEntries.slice(0, 10).map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{entry.order_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.shop_domain ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" title={entry.target_url}>
                    {entry.target_url.length > 40
                      ? entry.target_url.slice(0, 40) + '...'
                      : entry.target_url}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.response_status >= 200 && entry.response_status < 300
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
    </div>
  );
}
