import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listResource, createResource } from '../../lib/api';
import { DataTable, type Column } from '../../components/DataTable';
import { FormDialog } from '../../components/FormDialog';
import { formatDate } from '../../lib/utils';
import type { MockAdGroup } from '@shared/types/database';

const columns: Column<MockAdGroup>[] = [
  { key: 'ad_group_id', label: 'Ad Set ID' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'bid_amount', label: 'Bid', render: (v) => (v != null ? `$${v}` : '-') },
  { key: 'created_at', label: 'Created', render: (v) => formatDate(v as string) },
];

export function FacebookAdSets() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [bid, setBid] = useState('');

  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['facebook', 'ad-groups'],
    queryFn: () => listResource<MockAdGroup>('facebook', 'ad-groups'),
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource('facebook', 'ad-groups', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facebook', 'ad-groups'] });
      setDialogOpen(false);
      setName('');
      setCampaignId('');
      setBid('');
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Ad Sets</h1>
        <button
          onClick={() => setDialogOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + New Ad Set
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load: {(error as Error)?.message}</p>
      ) : (
        <DataTable columns={columns} data={(data?.data ?? []) as MockAdGroup[]} />
      )}

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create Ad Set"
        onSubmit={() => create.mutate({ name, campaign_id: campaignId, bid_amount: bid ? Number(bid) : null })}
      >
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Campaign ID</span>
          <input
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Bid Amount ($)</span>
          <input
            type="number"
            value={bid}
            onChange={(e) => setBid(e.target.value)}
            className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
      </FormDialog>
    </div>
  );
}
