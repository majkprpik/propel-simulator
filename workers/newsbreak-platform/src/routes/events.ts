import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';
import { triggerPostbacks } from '../../../../shared/utils/postbacks';

export const eventRoutes = new Hono<AppType>();

// NewsBreak Events: POST /api/events
eventRoutes.post('/api/events', async (c) => {
  if (testState.rateLimitEnabled) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }

  const db = getDb(c);
  const body = await c.req.json();

  // Validate click_id exists in mock_clicks if provided
  if (body.click_id) {
    const { data: click } = await db
      .from('mock_clicks')
      .select('id')
      .eq('platform', 'newsbreak')
      .eq('click_id', body.click_id)
      .single();

    if (!click) {
      return c.json({ error: `click_id '${body.click_id}' not found in mock_clicks` }, 400);
    }
  }

  // Require event_id for deduplication
  if (!body.event_id) {
    return c.json({ error: 'event_id is required for deduplication' }, 400);
  }

  const record = {
    platform: 'newsbreak' as const,
    pixel_id: body.pixel_id || 'unknown',
    event_name: body.event_name || 'conversion',
    event_id: body.event_id,
    event_time: body.event_time ? new Date(body.event_time).toISOString() : new Date().toISOString(),
    click_id: body.click_id || null,
    hashed_email: body.hashed_email || null,
    hashed_phone: body.hashed_phone || null,
    client_ip: body.client_ip || null,
    user_agent: body.user_agent || null,
    value: body.value || null,
    currency: body.currency || null,
    transaction_id: body.transaction_id || null,
    request_payload: body,
  };

  const { error } = await db.from('mock_events').upsert(record, { onConflict: 'platform,event_id' });
  if (error) return c.json({ error: error.message }, 500);

  // Trigger postbacks for the successfully stored event
  await triggerPostbacks(db, {
    platform: 'newsbreak',
    pixel_id: body.pixel_id || 'unknown',
    event_name: body.event_name || 'conversion',
    event_data: body,
  });

  return c.json({ status: 'ok', event_id: record.event_id });
});
