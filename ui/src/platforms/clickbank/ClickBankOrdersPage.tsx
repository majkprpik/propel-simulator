import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clickbankFetch } from '../../lib/api';

interface CbAccount {
  id: string;
  account_id: string;
  nickname: string;
}

interface CbOrder {
  id: string;
  account_id: string | null;
  receipt: string;
  cb_order_id: string;
  product_site: string | null;
  product_item: string | null;
  affiliate_id: string | null;
  amount: number;
  currency: string;
  customer_email: string | null;
  status: string;
  cbpop: string | null;
  postback_received: boolean;
  created_at: string;
}

function generateReceipt(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) =>
    b.toString(16).padStart(2, '0').toUpperCase()
  ).join('');
  return `CB-${dateStr}-${hex}`;
}

function generateOrderId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) =>
    (b % 10).toString()
  ).join('');
}

export function ClickBankOrdersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    account_id: '',
    receipt: generateReceipt(),
    cb_order_id: generateOrderId(),
    product_site: '',
    product_item: '',
    affiliate_id: '',
    amount: '37.00',
    customer_email: '',
    cbpop: '',
  });

  const accounts = useQuery({
    queryKey: ['clickbank', 'accounts'],
    queryFn: () => clickbankFetch<{ data: CbAccount[] }>('/api/accounts'),
  });

  const orders = useQuery({
    queryKey: ['clickbank', 'orders'],
    queryFn: () => clickbankFetch<{ data: CbOrder[]; total: number }>('/api/orders'),
  });

  const createOrder = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clickbankFetch('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clickbank', 'orders'] });
      setShowForm(false);
      setForm({
        account_id: '',
        receipt: generateReceipt(),
        cb_order_id: generateOrderId(),
        product_site: '',
        product_item: '',
        affiliate_id: '',
        amount: '37.00',
        customer_email: '',
        cbpop: '',
      });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: (id: string) => clickbankFetch(`/api/orders/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clickbank', 'orders'] }),
  });

  function handleSubmit() {
    const body = {
      ...form,
      amount: parseFloat(form.amount),
      account_id: form.account_id || undefined,
      cbpop: form.cbpop || undefined,
      customer_email: form.customer_email || undefined,
      affiliate_id: form.affiliate_id || undefined,
    };
    createOrder.mutate(body);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create Order
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Create Order</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Account</span>
              <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none">
                <option value="">— optional —</option>
                {(accounts.data?.data ?? []).map((a) => <option key={a.account_id} value={a.account_id}>{a.nickname}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Receipt</span>
              <input value={form.receipt} onChange={(e) => setForm({ ...form, receipt: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">CB Order ID</span>
              <input value={form.cb_order_id} onChange={(e) => setForm({ ...form, cb_order_id: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Product Site</span>
              <input value={form.product_site} onChange={(e) => setForm({ ...form, product_site: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Product Item</span>
              <input value={form.product_item} onChange={(e) => setForm({ ...form, product_item: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Affiliate ID</span>
              <input value={form.affiliate_id} onChange={(e) => setForm({ ...form, affiliate_id: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Amount ($)</span>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Customer Email</span>
              <input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-card-foreground">cbpop (Propel Click ID)</span>
              <input value={form.cbpop} onChange={(e) => setForm({ ...form, cbpop: e.target.value })} placeholder="Propel click_id — paste here to simulate attribution" className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSubmit} disabled={createOrder.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              Create
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {orders.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : orders.isError ? (
        <p className="text-sm text-destructive">Failed to load: {orders.error?.message}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Receipt</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">CB Order ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Affiliate</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">cbpop (Click ID)</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Postback</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(orders.data?.data ?? []).map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{order.receipt}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{order.cb_order_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.product_site && order.product_item ? `${order.product_site}/${order.product_item}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.affiliate_id ?? '—'}</td>
                  <td className="px-4 py-3">${Number(order.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {order.cbpop ? <code className="rounded bg-muted px-2 py-0.5 text-xs">{order.cbpop}</code> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${order.postback_received ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {order.postback_received ? 'Received' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { if (confirm('Delete this order?')) deleteOrder.mutate(order.id); }} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(orders.data?.data ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders yet. Create one to simulate a ClickBank sale.</p>
          )}
        </div>
      )}
    </div>
  );
}
