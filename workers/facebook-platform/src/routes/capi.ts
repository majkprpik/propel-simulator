import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';
import { triggerPostbacks } from '../../../../shared/utils/postbacks';
import { normalizeCurrency } from '../../../../shared/utils/currency';
import { EVENT_UPSERT_CONFLICT } from '../../../../shared/utils/crud-factory';

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
  const events = body.data ?? [];
  const fbtrace_id = `mock-${crypto.randomUUID().slice(0, 8)}`;

  // Collect all unique click IDs from events
  const allClickIds = events
    .map((e: Record<string, unknown>) => {
      const userData = e.user_data as Record<string, unknown> | undefined;
      return userData?.fbc as string | null;
    })
    .filter((id: string | null): id is string => !!id);

  // Batch query all click IDs at once
  let validClickIds = new Set<string>();
  if (allClickIds.length > 0) {
    const { data: clicks } = await db
      .from('mock_clicks')
      .select('click_id')
      .eq('platform', 'facebook')
      .in('click_id', allClickIds);
    if (clicks) {
      validClickIds = new Set(clicks.map((c: { click_id: string }) => c.click_id));
    }
  }

  // Store each event
  const failedEvents: Array<{ event_name: string; error: string }> = [];
  let successCount = 0;
  const postbackPromises: Promise<void>[] = [];

  for (const event of events) {
    // Validate click_id exists in mock_clicks if provided
    const clickId = event.user_data?.fbc || null;
    if (clickId && !validClickIds.has(clickId)) {
      failedEvents.push({
        event_name: event.event_name || 'unknown',
        error: `click_id '${clickId}' not found in mock_clicks`,
      });
      continue;
    }

    if (!event.event_id) {
      failedEvents.push({
        event_name: event.event_name || 'unknown',
        error: 'event_id is required for deduplication',
      });
      continue;
    }

    const record = {
      platform: 'facebook',
      pixel_id: pixelId,
      event_name: event.event_name,
      event_id: event.event_id,
      event_time: event.event_time ? new Date(event.event_time * 1000).toISOString() : new Date().toISOString(),
      click_id: clickId,
      hashed_email: event.user_data?.em?.[0] || null,
      hashed_phone: event.user_data?.ph?.[0] || null,
      client_ip: event.user_data?.client_ip_address || null,
      user_agent: event.user_data?.client_user_agent || null,
      value: event.custom_data?.value ?? null,
      currency: event.custom_data?.currency ? normalizeCurrency(event.custom_data.currency) : null,
      transaction_id: event.custom_data?.order_id || null,
      request_payload: event,
    };

    const { error } = await db.from('mock_events').upsert(record, { onConflict: EVENT_UPSERT_CONFLICT });

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

  // Fire all postbacks and wait for them before responding.
  // Errors are already handled inside triggerPostbacks; allSettled ensures
  // one failed postback doesn't prevent others from firing.
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
    }, 400);
  }

  return c.json({
    events_received: successCount,
    fbtrace_id,
    messages: failedEvents.length > 0 ? failedEvents.map(f => f.error) : [],
  });
});
