import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cakeFetch } from '../../lib/api';
import type { CakeAccount } from '@shared/types/database';

const CAKE_PORT = 8809;
const BASE_URL = import.meta.env.DEV ? '/api/cake' : `http://localhost:${CAKE_PORT}`;

export function CakeSettingsPage() {
  const qc = useQueryClient();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState({ name: '', api_key: 'mock-cake-api-key', domain: 'simulator.cakemarketing.com' });
  const [showAccountForm, setShowAccountForm] = useState(false);

  const accounts = useQuery({
    queryKey: ['cake', 'accounts'],
    queryFn: () => cakeFetch<{ data: CakeAccount[] }>('/api/accounts'),
  });

  const createAccount = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      cakeFetch('/api/accounts', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cake', 'accounts'] });
      setShowAccountForm(false);
      setAccountForm({ name: '', api_key: 'mock-cake-api-key', domain: 'simulator.cakemarketing.com' });
    },
  });

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
            <button onClick={() => copy(BASE_URL, 'url')} className="rounded border px-2 py-1 text-xs hover:bg-muted">
              {copiedField === 'url' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 font-medium text-muted-foreground">API Key</span>
            <code className="rounded bg-muted px-2 py-1">{primaryAccount?.api_key ?? 'mock-cake-api-key'}</code>
            <button onClick={() => copy(primaryAccount?.api_key ?? 'mock-cake-api-key', 'key')} className="rounded border px-2 py-1 text-xs hover:bg-muted">
              {copiedField === 'key' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 font-medium text-muted-foreground">Port</span>
            <code className="rounded bg-muted px-2 py-1">8809</code>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-muted/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Propel .dev.vars config</p>
          <pre className="text-xs text-foreground">
{`CAKE_API_URL=${BASE_URL}
CAKE_API_KEY=${primaryAccount?.api_key ?? 'mock-cake-api-key'}`}
          </pre>
        </div>

        <div className="mt-4 rounded-md bg-muted/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cake Offer API endpoint</p>
          <code className="text-xs">GET {BASE_URL}/api/1/offers.json?api_key=&lt;key&gt;&offer_status_id=1</code>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conversion postback URL template</p>
          <code className="text-xs">{BASE_URL}/pixel.track?s1={'{CLICK_ID}'}&offer_id={'{OFFER_ID}'}&amount={'{PAYOUT}'}</code>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cake API URL for Propel config</p>
          <code className="text-xs">{BASE_URL}</code>
        </div>
      </div>

      {/* Accounts */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <button
            onClick={() => setShowAccountForm(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Account
          </button>
        </div>

        {showAccountForm && (
          <div className="mb-4 rounded border bg-muted/30 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Name</span>
                <input value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">API Key</span>
                <input value={accountForm.api_key} onChange={(e) => setAccountForm({ ...accountForm, api_key: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-card-foreground">Domain</span>
                <input value={accountForm.domain} onChange={(e) => setAccountForm({ ...accountForm, domain: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
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
        ) : accounts.isError ? (
          <p className="text-sm text-destructive">Failed to load: {accounts.error?.message}</p>
        ) : (accounts.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts. Add one or seed with <code className="rounded bg-muted px-1">npm run seed -- seed --platform cake</code></p>
        ) : (
          <div className="space-y-2">
            {(accounts.data?.data ?? []).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded border bg-muted/30 px-4 py-2 text-sm">
                <div>
                  <span className="font-medium">{a.name}</span>
                  <span className="ml-2 text-muted-foreground">({a.account_id})</span>
                </div>
                <span className={`text-xs ${a.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
