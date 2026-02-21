import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listResource, createResource } from '../../lib/api';
import { DataTable, type Column } from '../../components/DataTable';
import { FormDialog } from '../../components/FormDialog';
import { formatDate } from '../../lib/utils';
import type { MockPixel } from '@shared/types/database';

const columns: Column<MockPixel>[] = [
  { key: 'pixel_id', label: 'Conversion Action ID' },
  { key: 'name', label: 'Name' },
  { key: 'access_token', label: 'API Key', render: (v) => v ? String(v).slice(0, 16) + '...' : '-' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created', render: (v) => formatDate(v as string) },
];

export function GoogleConversionActions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');

  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['google', 'pixels'],
    queryFn: () => listResource<MockPixel>('google', 'pixels'),
  });

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource('google', 'pixels', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google', 'pixels'] });
      setDialogOpen(false);
      setName('');
      setAccountId('');
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Conversion Actions</h1>
        <button onClick={() => setDialogOpen(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          + New Conversion Action
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load: {(error as Error)?.message}</p>
      ) : (
        <DataTable columns={columns} data={(data?.data ?? []) as MockPixel[]} />
      )}

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Create Conversion Action" onSubmit={() => create.mutate({ name, ad_account_id: accountId })}>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-card-foreground">Customer ID</span>
          <input value={accountId} onChange={(e) => setAccountId(e.target.value)} required className="mt-1 block w-full rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </label>
      </FormDialog>
    </div>
  );
}
