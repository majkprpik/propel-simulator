import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '../../components/StatsCard';
import { clickbankFetch } from '../../lib/api';

interface CbProduct {
  id: string;
  site: string;
  item: string;
  title: string;
  price: number;
  status: string;
}

interface CbOrder {
  id: string;
  receipt: string;
  amount: number;
}

interface CbPostback {
  id: string;
  receipt: string | null;
  product_site: string | null;
  product_item: string | null;
  amount: number | null;
  cbpop: string | null;
  order_matched: boolean;
  received_at: string;
}

export function ClickBankDashboard() {
  const products = useQuery({
    queryKey: ['clickbank', 'products'],
    queryFn: () => clickbankFetch<{ data: CbProduct[]; total: number }>('/api/products'),
  });

  const orders = useQuery({
    queryKey: ['clickbank', 'orders'],
    queryFn: () => clickbankFetch<{ data: CbOrder[]; total: number }>('/api/orders'),
  });

  const postbacks = useQuery({
    queryKey: ['clickbank', 'postbacks'],
    queryFn: () => clickbankFetch<{ data: CbPostback[]; total: number }>('/api/postbacks'),
    refetchInterval: 5000,
  });

  const totalRevenue = (postbacks.data?.data ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">ClickBank Dashboard</h1>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Products" value={products.data?.total ?? 0} />
        <StatsCard label="Total Orders" value={orders.data?.total ?? 0} />
        <StatsCard label="Postbacks Received" value={postbacks.data?.total ?? 0} />
        <StatsCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Postbacks</h2>
      {postbacks.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : postbacks.isError ? (
        <p className="text-sm text-destructive">Failed to load: {postbacks.error?.message}</p>
      ) : postbacks.data?.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No postbacks received yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Receipt</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">cbpop (Click ID)</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Matched</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Received At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(postbacks.data?.data ?? []).slice(0, 10).map((pb) => (
                <tr key={pb.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{pb.receipt ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {pb.product_site && pb.product_item ? `${pb.product_site}/${pb.product_item}` : '—'}
                  </td>
                  <td className="px-4 py-3">{pb.amount != null ? `$${Number(pb.amount).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">
                    {pb.cbpop ? <code className="rounded bg-muted px-2 py-0.5 text-xs">{pb.cbpop}</code> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${pb.order_matched ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {pb.order_matched ? 'Matched' : 'Unknown'}
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
