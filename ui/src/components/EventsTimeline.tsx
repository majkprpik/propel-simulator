import { useState } from 'react';
import { formatDate } from '../lib/utils';

interface TimelineEvent {
  id: string;
  event_name: string;
  pixel_id: string;
  received_at: string;
  value?: number | null;
  request_payload?: Record<string, unknown> | null;
}

interface EventsTimelineProps {
  events: TimelineEvent[];
}

export function EventsTimeline({ events }: EventsTimelineProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (events.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No events yet</p>;
  }

  return (
    <div className="space-y-0">
      {events.map((evt) => (
        <div key={evt.id} className="relative flex gap-4 pb-6">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <div className="w-px flex-1 bg-muted" />
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3">
              <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                {evt.event_name}
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(evt.received_at)}</span>
              {evt.value != null && (
                <span className="text-xs font-medium text-green-500">${evt.value}</span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pixel: {evt.pixel_id}
            </p>
            {evt.request_payload && (
              <button
                onClick={() => toggle(evt.id)}
                className="mt-1 text-xs text-primary hover:text-primary/80"
              >
                {expanded.has(evt.id) ? 'Hide payload' : 'Show payload'}
              </button>
            )}
            {expanded.has(evt.id) && evt.request_payload && (
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-3 text-xs text-card-foreground">
                {JSON.stringify(evt.request_payload, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
