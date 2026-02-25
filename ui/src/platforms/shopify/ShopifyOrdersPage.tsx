import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopifyFetch } from '../../lib/api';
import type { ShopifyShop } from '@shared/types/database';

function randomHex(len: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomOrderId(): number {
  return Math.floor(1000000000 + Math.random() * 9000000000);
}

interface Order {
  id: string;
  shop_domain: string;
  order_id: number;
  order_number: string;
  email: string;
  total_price: number;
  currency: string;
  checkout_token: string;
  landing_site: string;
  referring_site: string;
  source_name: string;
  financial_status: string;
  line_items: unknown[];
  customer: Record<string, unknown>;
  webhook_fired_at: string | null;
  webhook_target_url: string | null;
  created_at: string;
}

const DEFAULT_LINE_ITEMS = JSON.stringify(
  [{ title: 'Product', quantity: 1, price: '37.00' }],
  null,
  2
);

export function ShopifyOrdersPage() {
  const qc = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fireModal, setFireModal] = useState<Order | null>(null);
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000/shopify/webhook');
  const [fireResult, setFireResult] = useState<{ status: number; body: string } | null>(null);

  const [form, setForm] = useState({
    shop_domain: '',
    order_id: String(randomOrderId()),
    order_number: '#1001',
    email: 'customer@example.com',
    total_price: '37.00',
    checkout_token: `chk_${randomHex(8)}`,
    landing_site: 'https://example.com/lp?click_id=xxx',
    line_items: DEFAULT_LINE_ITEMS,
  });

  const shops = useQuery({
    queryKey: ['shopify', 'shops'],
    queryFn: () => shopifyFetch<{ data: ShopifyShop[] }>('/api/shops'),
  });

  const orders = useQuery({
    queryKey: ['shopify', 'orders'],
    queryFn: () => shopifyFetch<{ data: Order[]; total: number }>('/api/orders'),
    refetchInterval: 5000,
  });

  const createOrder = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      shopifyFetch('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shopify', 'orders'] });
      setShowCreateModal(false);
      setForm({
        shop_domain: '',
        order_id: String(randomOrderId()),
        order_number: '#1001',
        email: 'customer@example.com',
        total_price: '37.00',
        checkout_token: `chk_${randomHex(8)}`,
        landing_site: 'https://example.com/lp?click_id=xxx',
        line_items: DEFAULT_LINE_ITEMS,
      });
    },
  });

  const fireWebhook = useMutation({
    mutationFn: ({ orderId, target_url }: { orderId: string; target_url: string }) =>
      shopifyFetch<{ ok: boolean; status: number; body: string }>(
        `/api/orders/${orderId}/fire-webhook`,
        { method: 'POST', body: JSON.stringify({ target_url }) }
      ),
    onSuccess: (data) => {
      setFireResult({ status: data.status, body: data.body });
      qc.invalidateQueries({ queryKey: ['shopify', 'orders'] });
      qc.invalidateQueries({ queryKey: ['shopify', 'webhook-log'] });
    },
    onError: (err) => {
      setFireResult({ status: 0, body: err instanceof Error ? err.message : 'Unknown error' });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: (id: string) => shopifyFetch(`/api/orders/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopify', 'orders'] }),
  });

  function handleCreate() {
    let lineItems: unknown[];
    try {
      lineItems = JSON.parse(form.line_items);
    } catch {
      alert('Invalid JSON for line_items');
      return;
    }
    createOrder.mutate({
      shop_domain: form.shop_domain || undefined,
      order_id: Number(form.order_id),
      order_number: form.order_number,
      email: form.email,
      total_price: parseFloat(form.total_price),
      checkout_token: form.checkout_token,
      landing_site: form.landing_site,
      line_items: lineItems,
    });
  }

  function openFireModal(order: Order) {
    setFireModal(order);
    setFireResult(null);
    setTargetUrl('http://localhost:3000/shopify/webhook');
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <button
          onClick={() => {
            setForm((f) => ({
              ...f,
              shop_domain: shops.data?.data[0]?.shop_domain ?? '',
              order_id: String(randomOrderId()),
              checkout_token: `chk_${randomHex(8)}`,
            }));
            setShowCreateModal(true);
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create Order
        </button>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Create Order</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Shop</span>
                <select
                  value={form.shop_domain}
                  onChange={(e) => setForm({ ...form, shop_domain: e.target.value })}
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">— select shop —</option>
                  {(shops.data?.data ?? []).map((s) => (
                    <option key={s.shop_domain} value={s.shop_domain}>
                      {s.shop_domain}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Order ID</span>
                <input
                  type="number"
                  value={form.order_id}
                  onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Order Number</span>
                <input
                  value={form.order_number}
                  onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Email</span>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Total Price</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.total_price}
                  onChange={(e) => setForm({ ...form, total_price: e.target.value })}
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Checkout Token</span>
                <input
                  value={form.checkout_token}
                  onChange={(e) => setForm({ ...form, checkout_token: e.target.value })}
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="col-span-full block">
                <span className="text-sm font-medium text-card-foreground">Landing Site</span>
                <input
                  value={form.landing_site}
                  onChange={(e) => setForm({ ...form, landing_site: e.target.value })}
                  placeholder="https://example.com/lp?click_id=xxx"
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="col-span-full block">
                <span className="text-sm font-medium text-card-foreground">Line Items (JSON)</span>
                <textarea
                  rows={3}
                  value={form.line_items}
                  onChange={(e) => setForm({ ...form, line_items: e.target.value })}
                  className="mt-1 block w-full rounded-md border px-3 py-2 font-mono text-xs focus:border-primary focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreate}
                disabled={createOrder.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fire Webhook Modal */}
      {fireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Fire Webhook</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Order: <span className="font-mono">{fireModal.order_number}</span> (ID: {fireModal.order_id})
            </p>
            <label className="mb-4 block">
              <span className="text-sm font-medium">Target URL</span>
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            {fireResult && (
              <div className="mb-4 rounded-md border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Response:</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      fireResult.status >= 200 && fireResult.status < 300
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {fireResult.status || 'Error'}
                  </span>
                </div>
                <pre className="mt-2 max-h-24 overflow-auto rounded bg-muted p-2 text-xs">
                  {fireResult.body}
                </pre>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => fireWebhook.mutate({ orderId: fireModal.id, target_url: targetUrl })}
                disabled={fireWebhook.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {fireWebhook.isPending ? 'Firing...' : 'Fire'}
              </button>
              <button
                onClick={() => {
                  setFireModal(null);
                  setFireResult(null);
                }}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {orders.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : orders.isError ? (
        <p className="text-sm text-destructive">Failed to load: {orders.error?.message}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order #</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Shop</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Webhook</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(orders.data?.data ?? []).map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{order.order_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.email ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.shop_domain ?? '—'}</td>
                  <td className="px-4 py-3">${Number(order.total_price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.financial_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.financial_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {order.webhook_fired_at
                      ? new Date(order.webhook_fired_at).toLocaleString()
                      : 'Not fired'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openFireModal(order)}
                        className="rounded border px-2 py-1 text-xs hover:bg-muted"
                      >
                        Fire Webhook
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this order?')) deleteOrder.mutate(order.id);
                        }}
                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(orders.data?.data ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet. Create one to test webhook firing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
