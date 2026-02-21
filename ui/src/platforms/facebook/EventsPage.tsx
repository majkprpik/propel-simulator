import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvents, listResource } from '../../lib/api';
import { DataTable, type Column } from '../../components/DataTable';
import { formatDate } from '../../lib/utils';
import type { MockEvent, MockPixel } from '@shared/types/database';

const columns: Column<MockEvent>[] = [
  { key: 'event_name', label: 'Event' },
  { key: 'pixel_id', label: 'Pixel' },
  { key: 'click_id', label: 'Click ID', render: (v) => v ? String(v).slice(0, 12) + '...' : '-' },
  { key: 'value', label: 'Value', render: (v) => (v != null ? `$${v}` : '-') },
  { key: 'received_at', label: 'Received', render: (v) => formatDate(v as string) },
];

export function FacebookEvents() {
  const [pixelFilter, setPixelFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const pixels = useQuery({
    queryKey: ['facebook', 'pixels'],
    queryFn: () => listResource<MockPixel>('facebook', 'pixels'),
  });

  const events = useQuery({
    queryKey: ['facebook', 'events', pixelFilter],
    queryFn: () => getEvents('facebook', pixelFilter || undefined),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <select
          value={pixelFilter}
          onChange={(e) => setPixelFilter(e.target.value)}
          className="rounded-md border border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">All Pixels</option>
          {(pixels.data?.data ?? []).map((p) => (
            <option key={p.pixel_id} value={p.pixel_id}>
              {p.name} ({p.pixel_id})
            </option>
          ))}
        </select>
      </div>

      {events.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={(events.data?.data ?? []) as MockEvent[]}
            onRowClick={(row) =>
              setExpandedRow(expandedRow === row.id ? null : row.id)
            }
          />
          {expandedRow && (() => {
            const evt = (events.data?.data ?? []).find(
              (e: unknown) => (e as MockEvent).id === expandedRow
            ) as MockEvent | undefined;
            if (!evt?.request_payload) return null;
            return (
              <pre className="mt-2 rounded-lg border border bg-muted p-4 text-xs text-card-foreground">
                {JSON.stringify(evt.request_payload, null, 2)}
              </pre>
            );
          })()}
        </>
      )}
    </div>
  );
}
