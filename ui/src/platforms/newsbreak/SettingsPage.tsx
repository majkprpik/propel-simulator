import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listResource, createResource } from '../../lib/api';
import type { MockPostbackConfig } from '@shared/types/database';

export function NewsBreakSettings() {
  const [postbackUrl, setPostbackUrl] = useState('');
  const [eventName, setEventName] = useState('conversion');
  const [accountId, setAccountId] = useState('');

  const queryClient = useQueryClient();
  const configs = useQuery({ queryKey: ['newsbreak', 'postback-configs'], queryFn: () => listResource<MockPostbackConfig>('newsbreak', 'postback-configs') });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource('newsbreak', 'postback-configs', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['newsbreak', 'postback-configs'] }); setPostbackUrl(''); setEventName('conversion'); setAccountId(''); },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>
      <div className="mb-8 rounded-lg border border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">API Information</h2>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium text-muted-foreground">Reports Endpoint:</span> <code className="rounded bg-accent px-2 py-0.5">GET http://localhost:8804/reports/getIntegratedReport</code></p>
          <p><span className="font-medium text-muted-foreground">Campaign List:</span> <code className="rounded bg-accent px-2 py-0.5">GET http://localhost:8804/campaign/getList</code></p>
          <p><span className="font-medium text-muted-foreground">Port:</span> 8804</p>
          <p><span className="font-medium text-muted-foreground">Platform:</span> newsbreak</p>
        </div>
      </div>
      <div className="rounded-lg border border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Postback URL Configuration</h2>
        <div className="mb-6 space-y-3">
          <label className="block"><span className="text-sm font-medium text-card-foreground">Account ID</span><input value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" /></label>
          <label className="block"><span className="text-sm font-medium text-card-foreground">Event Name</span><input value={eventName} onChange={(e) => setEventName(e.target.value)} className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" /></label>
          <label className="block"><span className="text-sm font-medium text-card-foreground">Postback URL</span><input value={postbackUrl} onChange={(e) => setPostbackUrl(e.target.value)} className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" /></label>
          <button onClick={() => create.mutate({ ad_account_id: accountId, name: `${eventName} Postback`, postback_url: postbackUrl, event_name: eventName })} disabled={!postbackUrl || !accountId} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">Save Config</button>
        </div>
        {configs.data?.data && configs.data.data.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Existing Configs</h3>
            <div className="space-y-2">
              {configs.data.data.map((cfg) => (
                <div key={cfg.id} className="flex items-center justify-between rounded border border-gray-100 bg-muted px-4 py-2 text-sm">
                  <span>{cfg.event_name} → <code className="text-xs">{cfg.postback_url}</code></span>
                  <span className={`text-xs ${cfg.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>{cfg.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
