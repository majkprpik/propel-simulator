import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasoffersFetch } from '../../lib/api';

interface HoOffer {
  id: string;
  offer_id: number;
  name: string;
}

interface HoClick {
  id: string;
  click_id: string;
  offer_id: number | null;
  affiliate_id: string | null;
  converted: boolean;
  clicked_at: string;
  mock_ho_offers?: { name: string };
}

export function HasOffersClicksPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [genForm, setGenForm] = useState({ offer_id: '', count: '1' });
  const [copied, setCopied] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const offers = useQuery({
    queryKey: ['hasoffers', 'offers'],
    queryFn: () => hasoffersFetch<{ data: HoOffer[] }>('/api/offers'),
  });

  const clicks = useQuery({
    queryKey: ['hasoffers', 'clicks'],
    queryFn: () => hasoffersFetch<{ data: HoClick[]; total: number }>('/api/clicks'),
    refetchInterval: 5000,
  });

  const generate = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      hasoffersFetch('/api/clicks/generate', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hasoffers', 'clicks'] });
      setShowModal(false);
      setGenForm({ offer_id: '', count: '1' });
    },
  });

  const deleteClick = useMutation({
    mutationFn: (id: string) => hasoffersFetch(`/api/clicks/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hasoffers', 'clicks'] }),
  });

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Clicks</h1>
        <button
          onClick={() => {
            setGenForm({ offer_id: offers.data?.data[0]?.offer_id?.toString() ?? '', count: '1' });
            setShowModal(true);
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Generate Clicks
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Generate Test Clicks</h2>
            <label className="mb-3 block">
              <span className="text-sm font-medium">Offer</span>
              <select value={genForm.offer_id} onChange={(e) => setGenForm({ ...genForm, offer_id: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none">
                <option value="">— any offer —</option>
                {(offers.data?.data ?? []).map((o) => (
                  <option key={o.offer_id} value={String(o.offer_id)}>{o.name}</option>
                ))}
              </select>
            </label>
            <label className="mb-4 block">
              <span className="text-sm font-medium">Count (1–100)</span>
              <input type="number" min="1" max="100" value={genForm.count} onChange={(e) => setGenForm({ ...genForm, count: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => generate.mutate({ offer_id: genForm.offer_id ? Number(genForm.offer_id) : undefined, count: Number(genForm.count) })}
                disabled={generate.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Generate
              </button>
              <button onClick={() => setShowModal(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {clicks.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Click ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Offer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Clicked At</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Converted</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(clicks.data?.data ?? []).map((click) => (
                <tr key={click.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-0.5 text-xs">{click.click_id}</code>
                      <button
                        onClick={() => copyToClipboard(click.click_id)}
                        className="rounded border px-2 py-0.5 text-xs hover:bg-muted"
                        title="Copy to clipboard"
                      >
                        {copied === click.click_id ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {click.mock_ho_offers?.name ?? click.offer_id ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(click.clicked_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${click.converted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {click.converted ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { if (confirm('Delete this click?')) deleteClick.mutate(click.id); }} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(clicks.data?.data ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No clicks yet. Generate some to test conversion tracking.</p>
          )}
        </div>
      )}
    </div>
  );
}
