import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clickbankFetch } from './api';

interface CbAccount {
  id: string;
  account_id: string;
  nickname: string;
  api_key: string;
  dev_key: string;
  status: string;
  created_at: string;
}

interface CbPostbackConfig {
  id: string;
  account_id: string | null;
  name: string;
  postback_url: string;
  event_name: string;
  is_active: boolean;
  created_at: string;
}

const BASE_URL = 'http://localhost:8808';

export function ClickBankSettingsPage() {
  const qc = useQueryClient();
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountForm, setAccountForm] = useState({ nickname: '', api_key: 'mock-cb-api-key', dev_key: 'mock-cb-dev-key' });
  const [copied, setCopied] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accounts = useQuery({
    queryKey: ['clickbank', 'accounts'],
    queryFn: () => clickbankFetch<{ data: CbAccount[] }>('/api/accounts'),
  });

  const configs = useQuery({
    queryKey: ['clickbank', 'postback-configs'],
    queryFn: () => clickbankFetch<{ data: CbPostbackConfig[] }>('/api/postback-configs'),
  });

  const createAccount = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clickbankFetch('/api/accounts', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clickbank', 'accounts'] });
      setShowAccountForm(false);
      setAccountForm({ nickname: '', api_key: 'mock-cb-api-key', dev_key: 'mock-cb-dev-key' });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: (id: string) => clickbankFetch(`/api/accounts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clickbank', 'accounts'] }),
  });

  const deleteConfig = useMutation({
    mutationFn: (id: string) => clickbankFetch(`/api/postback-configs/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clickbank', 'postback-configs'] }),
  });

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(null), 2000);
  }

  const postbackUrl = `GET ${BASE_URL}/conversions?receipt=^receipt^&cbOrderId=^cbOrderId^&cbpop=^cbPop^&amount=^amount^&siteName=^siteName^&item=^item^&affiliate=^affiliate^`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Accounts */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">ClickBank Accounts</h2>
          <button
            onClick={() => setShowAccountForm(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Account
          </button>
        </div>

        {showAccountForm && (
          <div className="mb-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium">Nickname</span>
                <input value={accountForm.nickname} onChange={(e) => setAccountForm({ ...accountForm, nickname: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">API Key</span>
                <input value={accountForm.api_key} onChange={(e) => setAccountForm({ ...accountForm, api_key: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Dev Key</span>
                <input value={accountForm.dev_key} onChange={(e) => setAccountForm({ ...accountForm, dev_key: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => createAccount.mutate(accountForm)} disabled={!accountForm.nickname || createAccount.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Create</button>
              <button onClick={() => setShowAccountForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
            </div>
          </div>
        )}

        {accounts.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (accounts.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts yet. Add one to get started.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nickname</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Account ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">API Key</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dev Key</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(accounts.data?.data ?? []).map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{a.nickname}</td>
                    <td className="px-4 py-3"><code className="rounded bg-muted px-2 py-0.5 text-xs">{a.account_id}</code></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-0.5 text-xs">{a.api_key}</code>
                        <button onClick={() => copy(a.api_key)} className="rounded border px-2 py-0.5 text-xs hover:bg-muted">{copied === a.api_key ? '✓' : 'Copy'}</button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-0.5 text-xs">{a.dev_key}</code>
                        <button onClick={() => copy(a.dev_key)} className="rounded border px-2 py-0.5 text-xs hover:bg-muted">{copied === a.dev_key ? '✓' : 'Copy'}</button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${a.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { if (confirm('Delete this account?')) deleteAccount.mutate(a.id); }} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
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
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-40 font-medium text-muted-foreground">API Base URL</span>
            <code className="rounded bg-muted px-2 py-1">{BASE_URL}</code>
            <button onClick={() => copy(BASE_URL)} className="rounded border px-2 py-1 text-xs hover:bg-muted">{copied === BASE_URL ? '✓ Copied' : 'Copy'}</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-40 font-medium text-muted-foreground">API Key</span>
            <code className="rounded bg-muted px-2 py-1">mock-cb-api-key</code>
            <button onClick={() => copy('mock-cb-api-key')} className="rounded border px-2 py-1 text-xs hover:bg-muted">{copied === 'mock-cb-api-key' ? '✓ Copied' : 'Copy'}</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-40 font-medium text-muted-foreground">Dev Key</span>
            <code className="rounded bg-muted px-2 py-1">mock-cb-dev-key</code>
            <button onClick={() => copy('mock-cb-dev-key')} className="rounded border px-2 py-1 text-xs hover:bg-muted">{copied === 'mock-cb-dev-key' ? '✓ Copied' : 'Copy'}</button>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-muted/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Postback URL (configure in ClickBank Vendor Settings)</p>
            <button onClick={() => copy(postbackUrl)} className="rounded border px-2 py-1 text-xs hover:bg-muted">{copied === postbackUrl ? '✓ Copied' : 'Copy'}</button>
          </div>
          <code className="block break-all text-xs text-foreground">{postbackUrl}</code>
        </div>

        <div className="mt-4 rounded-md bg-muted/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Propel .dev.vars config</p>
            <button onClick={() => copy(`CLICKBANK_API_URL=${BASE_URL}\nCLICKBANK_API_KEY=mock-cb-api-key\nCLICKBANK_DEV_KEY=mock-cb-dev-key`)} className="rounded border px-2 py-1 text-xs hover:bg-muted">
              {copied === `CLICKBANK_API_URL=${BASE_URL}\nCLICKBANK_API_KEY=mock-cb-api-key\nCLICKBANK_DEV_KEY=mock-cb-dev-key` ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-xs text-foreground">
{`CLICKBANK_API_URL=${BASE_URL}
CLICKBANK_API_KEY=mock-cb-api-key
CLICKBANK_DEV_KEY=mock-cb-dev-key`}
          </pre>
        </div>

        <div className="mt-4 rounded-md bg-muted/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product sync endpoint</p>
          <code className="text-xs">GET {BASE_URL}/1/products?site=&lt;vendor&gt;&apiKey=&lt;key&gt;&devKey=&lt;devkey&gt;</code>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order verification endpoint</p>
          <code className="text-xs">GET {BASE_URL}/1/orders/&lt;receipt&gt;</code>
        </div>
      </div>

      {/* Postback Configs */}
      {(configs.data?.data ?? []).length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Postback Webhook Configs</h2>
          <div className="space-y-2">
            {(configs.data?.data ?? []).map((cfg) => (
              <div key={cfg.id} className="flex items-center justify-between rounded border bg-muted/30 px-4 py-2 text-sm">
                <div>
                  <span className="font-medium">{cfg.name}</span>
                  <span className="mx-2 text-muted-foreground">→</span>
                  <code className="text-xs">{cfg.postback_url}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${cfg.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>{cfg.is_active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => { if (confirm('Delete config?')) deleteConfig.mutate(cfg.id); }} className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
