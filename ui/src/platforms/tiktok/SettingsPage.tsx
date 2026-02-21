import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listResource, createResource } from '../../lib/api';
import type { MockPostbackConfig } from '@shared/types/database';

export function TikTokSettings() {
  const [postbackUrl, setPostbackUrl] = useState('');
  const [eventName, setEventName] = useState('CompletePayment');
  const [accountId, setAccountId] = useState('');

  const queryClient = useQueryClient();
  const configs = useQuery({ queryKey: ['tiktok', 'postback-configs'], queryFn: () => listResource<MockPostbackConfig>('tiktok', 'postback-configs') });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource('tiktok', 'postback-configs', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tiktok', 'postback-configs'] }); setPostbackUrl(''); setEventName('CompletePayment'); setAccountId(''); },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>
      <div className="mb-8 rounded-lg border border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">API Information</h2>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium text-muted-foreground">Events API Endpoint:</span> <code className="rounded bg-accent px-2 py-0.5">POST http://localhost:8803/open_api/v1.3/event/track/</code></p>
          <p><span className="font-medium text-muted-foreground">Port:</span> 8803</p>
          <p><span className="font-medium text-muted-foreground">Platform:</span> tiktok</p>
        </div>
      </div>
      <div className="rounded-lg border border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Postback URL Configuration</h2>
        <div className="mb-6 space-y-3">
          <label className="block"><span className="text-sm font-medium text-card-foreground">Advertiser ID</span><input value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" /></label>
          <label className="block"><span className="text-sm font-medium text-card-foreground">Event Name</span><select value={eventName} onChange={(e) => setEventName(e.target.value)} className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"><option>CompletePayment</option><option>SubmitForm</option><option>Registration</option></select></label>
          <label className="block"><span className="text-sm font-medium text-card-foreground">Postback URL</span><input value={postbackUrl} onChange={(e) => setPostbackUrl(e.target.value)} className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" /></label>
          <button onClick={() => create.mutate({ ad_account_id: accountId, name: `${eventName} Postback`, postback_url: postbackUrl, event_name: eventName })} disabled={!postbackUrl || !accountId} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Save Config</button>
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
