import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasoffersFetch } from '../../lib/api';

interface HoOffer {
  id: string;
  account_id: string | null;
  offer_id: number;
  name: string;
  offer_url: string;
  preview_url: string;
  default_payout: number;
  default_payout_type: string;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
}

interface HoAccount {
  id: string;
  account_id: string;
  name: string;
  status: string;
}

const PAYOUT_TYPES = ['cpa_flat', 'cpl', 'cps', 'revshare'];
const STATUSES = ['active', 'paused', 'archived'];

export function HasOffersOffersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HoOffer | null>(null);
  const [form, setForm] = useState({ name: '', offer_url: '', default_payout: '5.00', default_payout_type: 'cpa_flat', status: 'active', account_id: '' });

  const accounts = useQuery({
    queryKey: ['hasoffers', 'accounts'],
    queryFn: () => hasoffersFetch<{ data: HoAccount[] }>('/api/accounts'),
  });

  const offers = useQuery({
    queryKey: ['hasoffers', 'offers'],
    queryFn: () => hasoffersFetch<{ data: HoOffer[]; total: number }>('/api/offers'),
  });

  const createOffer = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      hasoffersFetch('/api/offers', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hasoffers', 'offers'] });
      setShowForm(false);
      setForm({ name: '', offer_url: '', default_payout: '5.00', default_payout_type: 'cpa_flat', status: 'active', account_id: '' });
    },
  });

  const updateOffer = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      hasoffersFetch(`/api/offers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hasoffers', 'offers'] });
      setEditing(null);
    },
  });

  const deleteOffer = useMutation({
    mutationFn: (id: string) => hasoffersFetch(`/api/offers/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hasoffers', 'offers'] }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: '', offer_url: '', default_payout: '5.00', default_payout_type: 'cpa_flat', status: 'active', account_id: accounts.data?.data[0]?.account_id ?? '' });
    setShowForm(true);
  }

  function openEdit(offer: HoOffer) {
    setEditing(offer);
    setForm({ name: offer.name, offer_url: offer.offer_url, default_payout: String(offer.default_payout), default_payout_type: offer.default_payout_type, status: offer.status, account_id: offer.account_id ?? '' });
    setShowForm(true);
  }

  function handleSubmit() {
    const body = { ...form, default_payout: parseFloat(form.default_payout) };
    if (editing) {
      updateOffer.mutate({ id: editing.id, body });
    } else {
      createOffer.mutate(body);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Offers</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create Offer
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{editing ? 'Edit Offer' : 'Create Offer'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Offer URL</span>
              <input value={form.offer_url} onChange={(e) => setForm({ ...form, offer_url: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Default Payout ($)</span>
              <input type="number" step="0.01" value={form.default_payout} onChange={(e) => setForm({ ...form, default_payout: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Payout Type</span>
              <select value={form.default_payout_type} onChange={(e) => setForm({ ...form, default_payout_type: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none">
                {PAYOUT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-card-foreground">Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            {!editing && (
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Account</span>
                <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none">
                  <option value="">— select account —</option>
                  {(accounts.data?.data ?? []).map((a) => <option key={a.account_id} value={a.account_id}>{a.name}</option>)}
                </select>
              </label>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSubmit} disabled={createOffer.isPending || updateOffer.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {editing ? 'Save' : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {offers.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payout</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(offers.data?.data ?? []).map((offer) => (
                <tr key={offer.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{offer.offer_id}</td>
                  <td className="px-4 py-3 font-medium">{offer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{offer.default_payout_type}</td>
                  <td className="px-4 py-3">${Number(offer.default_payout).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${offer.status === 'active' ? 'bg-green-100 text-green-700' : offer.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(offer)} className="rounded border px-2 py-1 text-xs hover:bg-muted">Edit</button>
                      <button
                        onClick={() => updateOffer.mutate({ id: offer.id, body: { status: offer.status === 'active' ? 'paused' : 'active' } })}
                        className="rounded border px-2 py-1 text-xs hover:bg-muted"
                      >
                        {offer.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <button onClick={() => { if (confirm('Delete this offer?')) deleteOffer.mutate(offer.id); }} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(offers.data?.data ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No offers yet. Create one to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}
