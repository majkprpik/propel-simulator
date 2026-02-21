import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasoffersFetch } from '../../lib/api';

interface HoAccount {
  id: string;
  account_id: string;
  name: string;
  network_id: string;
  api_key: string;
  status: string;
}

const BASE_URL = 'http://localhost:8810';

export function HasOffersSettingsPage() {
  const qc = useQueryClient();
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', network_id: 'simulator' });

  const accounts = useQuery({
    queryKey: ['hasoffers', 'accounts'],
    queryFn: () => hasoffersFetch<{ data: HoAccount[] }>('/api/accounts'),
  });

  const createAccount = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      hasoffersFetch('/api/accounts', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hasoffers', 'accounts'] });
      setShowAccountForm(false);
      setAccountForm({ name: '', network_id: 'simulator' });
    },
  });

  const updateAccount = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      hasoffersFetch(`/api/accounts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hasoffers', 'accounts'] }),
  });

  function copy(text: string, setter: (v: boolean) => void) {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  const primaryAccount = accounts.data?.data[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* API Information */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">API Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-32 font-medium text-muted-foreground">Base URL</span>
            <code className="rounded bg-muted px-2 py-1">{BASE_URL}</code>
            <button onClick={() => copy(BASE_URL, setCopiedUrl)} className="rounded border px-2 py-1 text-xs hover:bg-muted">
              {copiedUrl ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 font-medium text-muted-foreground">Network Token</span>
            <code className="rounded bg-muted px-2 py-1">{primaryAccount?.api_key ?? 'mock-ho-network-token'}</code>
            <button onClick={() => copy(primaryAccount?.api_key ?? 'mock-ho-network-token', setCopiedToken)} className="rounded border px-2 py-1 text-xs hover:bg-muted">
              {copiedToken ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 font-medium text-muted-foreground">Network ID</span>
            <code className="rounded bg-muted px-2 py-1">{primaryAccount?.network_id ?? 'simulator'}</code>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 font-medium text-muted-foreground">Port</span>
            <code className="rounded bg-muted px-2 py-1">8810</code>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-muted/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Propel .dev.vars config</p>
          <pre className="text-xs text-foreground">
{`HASOFFERS_API_URL=${BASE_URL}
HASOFFERS_NETWORK_TOKEN=${primaryAccount?.api_key ?? 'mock-ho-network-token'}`}
          </pre>
        </div>

        <div className="mt-4 rounded-md bg-muted/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Offer sync endpoint</p>
          <code className="text-xs">GET {BASE_URL}/Apiv3/json?Service=Offer&Method=findAll&network_token=...&page=1&limit=100</code>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Postback URL template</p>
          <code className="text-xs">GET {BASE_URL}/aff_lsr.php?transaction_id={'{CLICK_ID}'}&offer_id={'{OFFER_ID}'}&payout={'{PAYOUT}'}</code>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alternative Goal tracking endpoint</p>
          <code className="text-xs">GET {BASE_URL}/Apiv3/json?Service=Goal&Method=track&transaction_id=...&offer_id=...&payout=...</code>
        </div>
      </div>

      {/* Network Accounts */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Network Accounts</h2>
          <button
            onClick={() => setShowAccountForm(!showAccountForm)}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Account
          </button>
        </div>

        {showAccountForm && (
          <div className="mb-4 rounded border bg-muted/30 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Name</span>
                <input value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Network ID</span>
                <input value={accountForm.network_id} onChange={(e) => setAccountForm({ ...accountForm, network_id: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => createAccount.mutate(accountForm)}
                disabled={!accountForm.name || createAccount.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Create
              </button>
              <button onClick={() => setShowAccountForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
            </div>
          </div>
        )}

        {accounts.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (accounts.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts. Click "Add Account" to create one.</p>
        ) : (
          <div className="space-y-2">
            {(accounts.data?.data ?? []).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded border bg-muted/30 px-4 py-2 text-sm">
                <div>
                  <span className="font-medium">{a.name}</span>
                  <span className="ml-2 text-muted-foreground">({a.account_id})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${a.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}>{a.status}</span>
                  <button
                    onClick={() => updateAccount.mutate({ id: a.id, body: { status: a.status === 'active' ? 'inactive' : 'active' } })}
                    className="rounded border px-2 py-0.5 text-xs hover:bg-muted"
                  >
                    {a.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
