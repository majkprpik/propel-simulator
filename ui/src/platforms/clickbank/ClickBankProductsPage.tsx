import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clickbankFetch } from '../../lib/api';

interface CbAccount {
  id: string;
  account_id: string;
  nickname: string;
}

interface CbProduct {
  id: string;
  account_id: string;
  site: string;
  item: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  gravity: number;
  commission_rate: number;
  hoplink: string;
  status: string;
  created_at: string;
}

const STATUSES = ['active', 'paused'];

export function ClickBankProductsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CbProduct | null>(null);
  const [form, setForm] = useState({
    account_id: '',
    site: '',
    item: '',
    title: '',
    description: '',
    price: '37.00',
    commission_rate: '75',
    gravity: '50',
    hoplink: '',
    status: 'active',
  });

  const accounts = useQuery({
    queryKey: ['clickbank', 'accounts'],
    queryFn: () => clickbankFetch<{ data: CbAccount[] }>('/api/accounts'),
  });

  const products = useQuery({
    queryKey: ['clickbank', 'products'],
    queryFn: () => clickbankFetch<{ data: CbProduct[]; total: number }>('/api/products'),
  });

  const createProduct = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clickbankFetch('/api/products', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clickbank', 'products'] });
      setShowForm(false);
      resetForm();
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      clickbankFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clickbank', 'products'] });
      setEditing(null);
      setShowForm(false);
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => clickbankFetch(`/api/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clickbank', 'products'] }),
  });

  function resetForm() {
    setForm({ account_id: accounts.data?.data[0]?.account_id ?? '', site: '', item: '', title: '', description: '', price: '37.00', commission_rate: '75', gravity: '50', hoplink: '', status: 'active' });
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setShowForm(true);
  }

  function openEdit(product: CbProduct) {
    setEditing(product);
    setForm({
      account_id: product.account_id,
      site: product.site,
      item: product.item,
      title: product.title,
      description: product.description || '',
      price: String(product.price),
      commission_rate: String(product.commission_rate),
      gravity: String(product.gravity),
      hoplink: product.hoplink,
      status: product.status,
    });
    setShowForm(true);
  }

  function handleSubmit() {
    const body = {
      ...form,
      price: parseFloat(form.price),
      commission_rate: parseFloat(form.commission_rate),
      gravity: parseFloat(form.gravity),
    };
    if (editing) {
      updateProduct.mutate({ id: editing.id, body });
    } else {
      createProduct.mutate(body);
    }
  }

  // Auto-suggest hoplink when site and item change
  function updateSiteItem(field: 'site' | 'item', value: string) {
    const newForm = { ...form, [field]: value };
    const site = field === 'site' ? value : form.site;
    const item = field === 'item' ? value : form.item;
    if (site && item && !editing) {
      newForm.hoplink = `https://${site}.pay.clickbank.net/?cbpop=TRACKING_ID&item=${item}`;
    }
    setForm(newForm);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create Product
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{editing ? 'Edit Product' : 'Create Product'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!editing && (
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Account</span>
                <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none">
                  <option value="">— select account —</option>
                  {(accounts.data?.data ?? []).map((a) => <option key={a.account_id} value={a.account_id}>{a.nickname}</option>)}
                </select>
              </label>
            )}
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Site (Vendor)</span>
              <input value={form.site} onChange={(e) => updateSiteItem('site', e.target.value)} placeholder="e.g. healthvendor" className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Item (Product Code)</span>
              <input value={form.item} onChange={(e) => updateSiteItem('item', e.target.value)} placeholder="e.g. weightloss" className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-card-foreground">Description</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Price ($)</span>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Commission Rate (%)</span>
              <input type="number" step="0.01" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Gravity</span>
              <input type="number" step="0.01" value={form.gravity} onChange={(e) => setForm({ ...form, gravity: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-card-foreground">Hoplink URL</span>
              <input value={form.hoplink} onChange={(e) => setForm({ ...form, hoplink: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSubmit} disabled={createProduct.isPending || updateProduct.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {editing ? 'Save' : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {products.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : products.isError ? (
        <p className="text-sm text-destructive">Failed to load: {products.error?.message}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Site</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Item</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commission</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Gravity</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(products.data?.data ?? []).map((product) => (
                <tr key={product.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{product.site}</td>
                  <td className="px-4 py-3 font-mono text-xs">{product.item}</td>
                  <td className="px-4 py-3 font-medium">{product.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-3">${Number(product.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{Number(product.commission_rate)}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{Number(product.gravity)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(product)} className="rounded border px-2 py-1 text-xs hover:bg-muted">Edit</button>
                      <button onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(product.id); }} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(products.data?.data ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No products yet. Create one to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}
