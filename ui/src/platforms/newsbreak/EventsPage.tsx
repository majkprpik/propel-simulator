import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../../lib/api';
import { DataTable, type Column } from '../../components/DataTable';
import { formatDate } from '../../lib/utils';
import type { MockEvent } from '@shared/types/database';
import { useState } from 'react';

const columns: Column<MockEvent>[] = [
  { key: 'event_name', label: 'Event' },
  { key: 'pixel_id', label: 'Pixel' },
  { key: 'click_id', label: 'Click ID', render: (v) => v ? String(v).slice(0, 12) + '...' : '-' },
  { key: 'value', label: 'Value', render: (v) => (v != null ? `$${v}` : '-') },
  { key: 'received_at', label: 'Received', render: (v) => formatDate(v as string) },
];

export function NewsBreakEvents() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const events = useQuery({ queryKey: ['newsbreak', 'events'], queryFn: () => getEvents('newsbreak') });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Events</h1>
      {events.isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
        <>
          <DataTable columns={columns} data={(events.data?.data ?? []) as MockEvent[]} onRowClick={(row) => setExpandedRow(expandedRow === row.id ? null : row.id)} />
          {expandedRow && (() => {
            const evt = (events.data?.data ?? []).find((e: unknown) => (e as MockEvent).id === expandedRow) as MockEvent | undefined;
            if (!evt?.request_payload) return null;
            return <pre className="mt-2 rounded-lg border border bg-muted p-4 text-xs text-card-foreground">{JSON.stringify(evt.request_payload, null, 2)}</pre>;
          })()}
        </>
      )}
    </div>
  );
}
