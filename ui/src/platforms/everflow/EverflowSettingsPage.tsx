import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { everflowFetch } from '../../lib/api';
import type { EfAccount, EfPostbackConfig } from '@shared/types/database';

const BASE_URL = 'http://localhost:8806';

export function EverflowSettingsPage() {
  const qc = useQueryClient();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [pbForm, setPbForm] = useState({ name: '', postback_url: '', event_name: 'conversion' });

  const accounts = useQuery({
    queryKey: ['everflow', 'accounts'],
    queryFn: () => everflowFetch<{ data: EfAccount[] }>('/api/accounts'),
  });

  const configs = useQuery({
    queryKey: ['everflow', 'postback-configs'],
    queryFn: () => everflowFetch<{ data: EfPostbackConfig[] }>('/api/postback-configs'),
  });

  const createConfig = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      everflowFetch('/api/postback-configs', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['everflow', 'postback-configs'] });
      setPbForm({ name: '', postback_url: '', event_name: 'conversion' });
    },
  });

  const toggleConfig = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      everflowFetch(`/api/postback-configs/${id}`, { method: 'PUT', body: JSON.stringify({ is_active }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['everflow', 'postback-configs'] }),
  });

  const deleteConfig = useMutation({
    mutationFn: (id: string) => everflowFetch(`/api/postback-configs/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['everflow', 'postback-configs'] }),
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
            <span className="w-32 font-medium text-muted-foreground">API Key</span>
            <code className="rounded bg-muted px-2 py-1">{primaryAccount?.api_key ?? 'mock-ef-api-key'}</code>
            <button onClick={() => copy(primaryAccount?.api_key ?? 'mock-ef-api-key', setCopiedKey)} className="rounded border px-2 py-1 text-xs hover:bg-muted">
              {copiedKey ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 font-medium text-muted-foreground">Network ID</span>
            <code className="rounded bg-muted px-2 py-1">{primaryAccount?.network_id ?? '—'}</code>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 font-medium text-muted-foreground">Port</span>
            <code className="rounded bg-muted px-2 py-1">8806</code>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-muted/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Propel .dev.vars config</p>
          <pre className="text-xs text-foreground">
{`EVERFLOW_API_URL=${BASE_URL}
EVERFLOW_API_KEY=${primaryAccount?.api_key ?? 'mock-ef-api-key'}`}
          </pre>
        </div>

        <div className="mt-4 rounded-md bg-muted/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Offer sync endpoint</p>
          <code className="text-xs">POST {BASE_URL}/v1/networks/offerstable</code>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conversion postback endpoint</p>
          <code className="text-xs">GET {BASE_URL}/conversions?transaction_id=&lt;id&gt;&amount=&lt;payout&gt;</code>
        </div>
      </div>

      {/* Accounts */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Network Accounts</h2>
        {accounts.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (accounts.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts. Seed one with <code className="rounded bg-muted px-1">npm run seed -- seed --platform everflow</code></p>
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

      {/* Postback Webhook Config */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Postback Webhook Configuration</h2>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-card-foreground">Name</span>
            <input value={pbForm.name} onChange={(e) => setPbForm({ ...pbForm, name: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-card-foreground">Event Name</span>
            <input value={pbForm.event_name} onChange={(e) => setPbForm({ ...pbForm, event_name: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </label>
          <label className="col-span-full block">
            <span className="text-sm font-medium text-card-foreground">Postback URL</span>
            <input value={pbForm.postback_url} onChange={(e) => setPbForm({ ...pbForm, postback_url: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="http://localhost:8789/postback?..." />
          </label>
        </div>
        <button
          onClick={() => createConfig.mutate(pbForm)}
          disabled={!pbForm.name || !pbForm.postback_url || createConfig.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Save Config
        </button>

        {(configs.data?.data ?? []).length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Existing Configs</h3>
            {(configs.data?.data ?? []).map((cfg) => (
              <div key={cfg.id} className="flex items-center justify-between rounded border bg-muted/30 px-4 py-2 text-sm">
                <div>
                  <span className="font-medium">{cfg.name}</span>
                  <span className="mx-2 text-muted-foreground">→</span>
                  <code className="text-xs">{cfg.postback_url}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${cfg.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>{cfg.is_active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => toggleConfig.mutate({ id: cfg.id, is_active: !cfg.is_active })} className="rounded border px-2 py-0.5 text-xs hover:bg-muted">{cfg.is_active ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => { if (confirm('Delete config?')) deleteConfig.mutate(cfg.id); }} className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
