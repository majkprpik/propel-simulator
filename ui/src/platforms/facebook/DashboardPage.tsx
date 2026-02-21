import { useQuery } from '@tanstack/react-query';
import { listResource, getEvents } from '../../lib/api';
import { StatsCard } from '../../components/StatsCard';
import { EventsTimeline } from '../../components/EventsTimeline';
import type { MockEvent, MockCampaign, MockPixel, MockClick } from '@shared/types/database';

export function FacebookDashboard() {
  const events = useQuery({
    queryKey: ['facebook', 'events'],
    queryFn: () => getEvents('facebook'),
  });
  const campaigns = useQuery({
    queryKey: ['facebook', 'campaigns'],
    queryFn: () => listResource<MockCampaign>('facebook', 'campaigns'),
  });
  const pixels = useQuery({
    queryKey: ['facebook', 'pixels'],
    queryFn: () => listResource<MockPixel>('facebook', 'pixels'),
  });
  const clicks = useQuery({
    queryKey: ['facebook', 'clicks'],
    queryFn: () => listResource<MockClick>('facebook', 'clicks'),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Facebook Dashboard</h1>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Events" value={events.data?.total ?? 0} />
        <StatsCard label="Campaigns" value={campaigns.data?.total ?? 0} />
        <StatsCard label="Pixels" value={pixels.data?.total ?? 0} />
        <StatsCard label="Clicks" value={clicks.data?.total ?? 0} />
      </div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Events</h2>
      {events.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <EventsTimeline events={(events.data?.data ?? []) as MockEvent[]} />
      )}
    </div>
  );
}
