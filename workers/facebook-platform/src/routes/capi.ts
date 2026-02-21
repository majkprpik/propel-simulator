import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';
import { triggerPostbacks } from '../../../../shared/utils/postbacks';
import { normalizeCurrency } from '../../../../shared/utils/currency';

export const capiRoutes = new Hono<AppType>();

// Facebook CAPI: POST /:version/:pixel_id/events
// e.g. POST /v18.0/123456789/events
capiRoutes.post('/:version/:pixel_id/events', async (c) => {
  // Rate limit check
  if (testState.rateLimitEnabled) {
    return c.json({ error: { message: 'Rate limit exceeded', type: 'OAuthException', code: 32, fbtrace_id: `mock-${crypto.randomUUID().slice(0, 8)}` } }, 429);
  }

  const pixelId = c.req.param('pixel_id');
  const db = getDb(c);

  // Validate pixel exists
  const { data: pixel } = await db
    .from('mock_pixels')
    .select('id')
    .eq('platform', 'facebook')
    .eq('pixel_id', pixelId)
    .single();

  if (!pixel) {
    return c.json({
      error: {
        message: `Pixel ID ${pixelId} not found`,
        type: 'OAuthException',
        code: 100,
        fbtrace_id: `mock-${crypto.randomUUID().slice(0, 8)}`,
      },
    }, 400);
  }

  const body = await c.req.json();
  const events = body.data || [];
  const fbtrace_id = `mock-${crypto.randomUUID().slice(0, 8)}`;

  // Store each event
  const failedEvents: Array<{ event_name: string; error: string }> = [];
  let successCount = 0;
  const postbackPromises: Promise<void>[] = [];

  for (const event of events) {
    // Validate click_id exists in mock_clicks if provided
    const clickId = event.user_data?.fbc || null;
    if (clickId) {
      const { data: click } = await db
        .from('mock_clicks')
        .select('id')
        .eq('platform', 'facebook')
        .eq('click_id', clickId)
        .single();

      if (!click) {
        failedEvents.push({
          event_name: event.event_name || 'unknown',
          error: `click_id '${clickId}' not found in mock_clicks`,
        });
        continue;
      }
    }

    if (!event.event_id) {
      failedEvents.push({
        event_name: event.event_name || 'unknown',
        error: 'event_id is required for deduplication',
      });
      continue;
    }

    const record = {
      platform: 'facebook' as const,
      pixel_id: pixelId,
      event_name: event.event_name,
      event_id: event.event_id,
      event_time: event.event_time ? new Date(event.event_time * 1000).toISOString() : new Date().toISOString(),
      click_id: clickId,
      hashed_email: event.user_data?.em?.[0] || null,
      hashed_phone: event.user_data?.ph?.[0] || null,
      client_ip: event.user_data?.client_ip_address || null,
      user_agent: event.user_data?.client_user_agent || null,
      value: event.custom_data?.value || null,
      currency: event.custom_data?.currency ? normalizeCurrency(event.custom_data.currency) : null,
      transaction_id: event.custom_data?.order_id || null,
      request_payload: event,
    };

    const { error } = await db.from('mock_events').upsert(record, { onConflict: 'platform,event_id' });

    if (error) {
      failedEvents.push({
        event_name: event.event_name || 'unknown',
        error: error.message
      });
    } else {
      successCount++;
      postbackPromises.push(
        triggerPostbacks(db, { platform: 'facebook', pixel_id: pixelId, event_name: event.event_name, event_data: event })
      );
    }
  }

  // Trigger postbacks for successfully stored events (non-blocking for response)
  await Promise.allSettled(postbackPromises);

  // If all events failed, return error
  if (failedEvents.length === events.length && events.length > 0) {
    return c.json({
      error: {
        message: 'All events failed to store',
        type: 'OAuthException',
        code: 100,
        fbtrace_id,
        details: failedEvents,
      },
    }, 500);
  }

  return c.json({
    events_received: successCount,
    fbtrace_id,
    messages: failedEvents.length > 0 ? failedEvents.map(f => f.error) : [],
  });
});
