import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopifyFetch } from '../../lib/api';
import type { ShopifyShop } from '@shared/types/database';

export function ShopifySettingsPage() {
  const qc = useQueryClient();
  const [showShopForm, setShowShopForm] = useState(false);
  const [shopForm, setShopForm] = useState({
    shop_domain: '',
    access_token: 'mock-shopify-token',
    webhook_secret: 'mock-webhook-secret',
  });
  const [copied, setCopied] = useState<string | null>(null);

  const shops = useQuery({
    queryKey: ['shopify', 'shops'],
    queryFn: () => shopifyFetch<{ data: ShopifyShop[] }>('/api/shops'),
  });

  const createShop = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      shopifyFetch('/api/shops', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shopify', 'shops'] });
      setShowShopForm(false);
      setShopForm({
        shop_domain: '',
        access_token: 'mock-shopify-token',
        webhook_secret: 'mock-webhook-secret',
      });
    },
  });

  const deleteShop = useMutation({
    mutationFn: (id: string) => shopifyFetch(`/api/shops/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopify', 'shops'] }),
  });

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  function maskValue(val: string): string {
    if (val.length <= 8) return '****';
    return val.slice(0, 4) + '****' + val.slice(-4);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Shops Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Shops</h2>
          <button
            onClick={() => setShowShopForm(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Shop
          </button>
        </div>

        {showShopForm && (
          <div className="mb-6 rounded-md border bg-muted/20 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Shop Domain</span>
                <input
                  value={shopForm.shop_domain}
                  onChange={(e) => setShopForm({ ...shopForm, shop_domain: e.target.value })}
                  placeholder="mystore.myshopify.com"
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Access Token</span>
                <input
                  value={shopForm.access_token}
                  onChange={(e) => setShopForm({ ...shopForm, access_token: e.target.value })}
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Webhook Secret</span>
                <input
                  value={shopForm.webhook_secret}
                  onChange={(e) => setShopForm({ ...shopForm, webhook_secret: e.target.value })}
                  className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => createShop.mutate(shopForm)}
                disabled={!shopForm.shop_domain || createShop.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => setShowShopForm(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {shops.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : shops.isError ? (
          <p className="text-sm text-destructive">Failed to load: {shops.error?.message}</p>
        ) : (shops.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No shops configured. Add a shop to get started.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Shop Domain
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Access Token
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Webhook Secret
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(shops.data?.data ?? []).map((shop) => (
                  <tr key={shop.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{shop.shop_domain}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          shop.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {shop.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {maskValue(shop.access_token)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {maskValue(shop.webhook_secret)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (confirm('Delete this shop?')) deleteShop.mutate(shop.id);
                        }}
                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Integration Config */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Integration Configuration</h2>
        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Shopify Webhook Endpoint (in Propel)
            </p>
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-3 py-1.5">
                POST http://localhost:8789/shopify/webhook
              </code>
              <button
                onClick={() => copy('http://localhost:8789/shopify/webhook')}
                className="rounded border px-2 py-1 text-xs hover:bg-muted"
              >
                {copied === 'http://localhost:8789/shopify/webhook' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Webhook Secret (in Propel .dev.vars)
            </p>
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-3 py-1.5">
                SHOPIFY_WEBHOOK_SECRET=mock-webhook-secret
              </code>
              <button
                onClick={() => copy('SHOPIFY_WEBHOOK_SECRET=mock-webhook-secret')}
                className="rounded border px-2 py-1 text-xs hover:bg-muted"
              >
                {copied === 'SHOPIFY_WEBHOOK_SECRET=mock-webhook-secret' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Test firing webhooks
            </p>
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-3 py-1.5">
                Use the Orders page → "Fire Webhook" button
              </code>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-muted/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Propel .dev.vars config
            </p>
            <pre className="text-xs text-foreground">
{`SHOPIFY_WEBHOOK_SECRET=mock-webhook-secret
SHOPIFY_SIMULATOR_URL=http://localhost:8807`}
            </pre>
            <button
              onClick={() =>
                copy(
                  'SHOPIFY_WEBHOOK_SECRET=mock-webhook-secret\nSHOPIFY_SIMULATOR_URL=http://localhost:8807'
                )
              }
              className="mt-2 rounded border px-2 py-1 text-xs hover:bg-muted"
            >
              {copied ===
              'SHOPIFY_WEBHOOK_SECRET=mock-webhook-secret\nSHOPIFY_SIMULATOR_URL=http://localhost:8807'
                ? 'Copied'
                : 'Copy All'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
