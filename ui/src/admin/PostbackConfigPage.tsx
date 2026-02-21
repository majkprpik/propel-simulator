import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listResource, createResource } from '../lib/api';
import { DataTable, type Column } from '../components/DataTable';
import { FormDialog } from '../components/FormDialog';
import { formatDate } from '../lib/utils';
import type { Platform, MockPostbackConfig } from '@shared/types/database';

const platforms: Platform[] = ['facebook', 'google', 'tiktok', 'newsbreak', 'snapchat'];

const columns: Column<MockPostbackConfig>[] = [
  { key: 'platform', label: 'Platform' },
  { key: 'name', label: 'Name' },
  { key: 'event_name', label: 'Event' },
  { key: 'postback_url', label: 'URL', render: (v) => String(v).length > 40 ? String(v).slice(0, 40) + '...' : String(v) },
  { key: 'is_active', label: 'Active', render: (v) => v ? 'Yes' : 'No' },
  { key: 'created_at', label: 'Created', render: (v) => formatDate(v as string) },
];

export function PostbackConfig() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>('facebook');
  const [name, setName] = useState('');
  const [eventName, setEventName] = useState('');
  const [postbackUrl, setPostbackUrl] = useState('');
  const [accountId, setAccountId] = useState('');

  const queryClient = useQueryClient();

  const allConfigs = platforms.map((p) => ({
    platform: p,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    query: useQuery({
      queryKey: [p, 'postback-configs'],
      queryFn: () => listResource<MockPostbackConfig>(p, 'postback-configs'),
    }),
  }));

  const allData = allConfigs.flatMap(
    (c) => (c.query.data?.data ?? []).map((d) => ({ ...d, platform: c.platform }))
  );

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource(platform, 'postback-configs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [platform, 'postback-configs'] });
      setDialogOpen(false);
      setName('');
      setEventName('');
      setPostbackUrl('');
      setAccountId('');
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Postback Configs</h1>
        <button
          onClick={() => setDialogOpen(true)}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + New Config
        </button>
      </div>

      <DataTable columns={columns} data={allData as MockPostbackConfig[]} />

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create Postback Config"
        onSubmit={() => create.mutate({ name, event_name: eventName, postback_url: postbackUrl, ad_account_id: accountId })}
      >
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Platform</span>
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none">
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Ad Account ID</span>
          <input value={accountId} onChange={(e) => setAccountId(e.target.value)} required className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Event Name</span>
          <input value={eventName} onChange={(e) => setEventName(e.target.value)} required className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Postback URL</span>
          <input value={postbackUrl} onChange={(e) => setPostbackUrl(e.target.value)} required className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </label>
      </FormDialog>
    </div>
  );
}
