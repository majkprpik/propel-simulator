import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listResource, createResource } from '../../lib/api';
import { DataTable, type Column } from '../../components/DataTable';
import { FormDialog } from '../../components/FormDialog';
import { formatDate } from '../../lib/utils';
import type { MockCampaign } from '@shared/types/database';

const columns: Column<MockCampaign>[] = [
  { key: 'campaign_id', label: 'Campaign ID' },
  { key: 'name', label: 'Name' },
  { key: 'objective', label: 'Objective' },
  { key: 'status', label: 'Status' },
  { key: 'daily_budget', label: 'Daily Budget', render: (v) => (v != null ? `$${v}` : '-') },
  { key: 'created_at', label: 'Created', render: (v) => formatDate(v as string) },
];

export function FacebookCampaigns() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('CONVERSIONS');
  const [budget, setBudget] = useState('');

  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['facebook', 'campaigns'],
    queryFn: () => listResource<MockCampaign>('facebook', 'campaigns'),
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource('facebook', 'campaigns', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facebook', 'campaigns'] });
      setDialogOpen(false);
      setName('');
      setObjective('CONVERSIONS');
      setBudget('');
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
        <button
          onClick={() => setDialogOpen(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + New Campaign
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load: {(error as Error)?.message}</p>
      ) : (
        <DataTable columns={columns} data={(data?.data ?? []) as MockCampaign[]} />
      )}

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Create Campaign"
        onSubmit={() => create.mutate({ name, objective, daily_budget: budget ? Number(budget) : null })}
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
          <span className="text-sm font-medium text-card-foreground">Objective</span>
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option>CONVERSIONS</option>
            <option>TRAFFIC</option>
            <option>LEAD_GENERATION</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Daily Budget ($)</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
      </FormDialog>
    </div>
  );
}
