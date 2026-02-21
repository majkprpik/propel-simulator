import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listResource, createResource } from '../../lib/api';
import { DataTable, type Column } from '../../components/DataTable';
import { FormDialog } from '../../components/FormDialog';
import { formatDate } from '../../lib/utils';
import type { MockAd } from '@shared/types/database';

const columns: Column<MockAd>[] = [
  { key: 'ad_id', label: 'Ad ID' },
  { key: 'name', label: 'Name' },
  { key: 'destination_url', label: 'Destination URL', render: (v) => v ? String(v).slice(0, 40) + (String(v).length > 40 ? '...' : '') : '-' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created', render: (v) => formatDate(v as string) },
];

export function SnapchatAds() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [adGroupId, setAdGroupId] = useState('');

  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['snapchat', 'ads'],
    queryFn: () => listResource<MockAd>('snapchat', 'ads'),
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource('snapchat', 'ads', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snapchat', 'ads'] });
      queryClient.invalidateQueries({ queryKey: ['snapchat', 'active-ads'] });
      setDialogOpen(false);
      setName('');
      setUrl('');
      setAdGroupId('');
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Ads</h1>
        <button
          onClick={() => setDialogOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-yellow-300"
        >
          + New Ad
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load: {(error as Error)?.message}</p>
      ) : (
        <DataTable columns={columns} data={(data?.data ?? []) as MockAd[]} />
      )}

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create Ad"
        onSubmit={() => create.mutate({ name, destination_url: url || null, ad_group_id: adGroupId || null })}
      >
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Ad Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Destination URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/landing"
            className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Ad Squad ID (optional)</span>
          <input
            value={adGroupId}
            onChange={(e) => setAdGroupId(e.target.value)}
            className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
      </FormDialog>
    </div>
  );
}
