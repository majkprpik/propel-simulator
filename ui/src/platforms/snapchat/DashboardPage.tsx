import { useQuery } from '@tanstack/react-query';
import { listResource, getEvents } from '../../lib/api';
import { StatsCard } from '../../components/StatsCard';
import { EventsTimeline } from '../../components/EventsTimeline';
import type { MockEvent, MockCampaign, MockPixel, MockClick } from '@shared/types/database';

export function SnapchatDashboard() {
  const events = useQuery({ queryKey: ['snapchat', 'events'], queryFn: () => getEvents('snapchat') });
  const campaigns = useQuery({ queryKey: ['snapchat', 'campaigns'], queryFn: () => listResource<MockCampaign>('snapchat', 'campaigns') });
  const pixels = useQuery({ queryKey: ['snapchat', 'pixels'], queryFn: () => listResource<MockPixel>('snapchat', 'pixels') });
  const clicks = useQuery({ queryKey: ['snapchat', 'clicks'], queryFn: () => listResource<MockClick>('snapchat', 'clicks') });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Snapchat Dashboard</h1>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Events" value={events.data?.total ?? 0} />
        <StatsCard label="Campaigns" value={campaigns.data?.total ?? 0} />
        <StatsCard label="Pixels" value={pixels.data?.total ?? 0} />
        <StatsCard label="Clicks" value={clicks.data?.total ?? 0} />
      </div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Events</h2>
      {events.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : events.isError ? (
        <p className="text-sm text-destructive">Failed to load: {events.error?.message}</p>
      ) : (
        <EventsTimeline events={(events.data?.data ?? []) as MockEvent[]} />
      )}
    </div>
  );
}
