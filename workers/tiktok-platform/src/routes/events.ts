import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';
import { triggerPostbacks } from '../../../../shared/utils/postbacks';
import { EVENT_UPSERT_CONFLICT } from '../../../../shared/utils/crud-factory';

export const eventRoutes = new Hono<AppType>();

// TikTok Events API: POST /open_api/v1.3/event/track/
eventRoutes.post('/open_api/v1.3/event/track/', async (c) => {
  // Rate limit check
  if (testState.rateLimitEnabled) {
    return c.json({
      code: 40100,
      message: 'Rate limit exceeded. Please retry later.',
    }, 429);
  }

  // Validate Access-Token header
  const accessToken = c.req.header('Access-Token');
  if (!accessToken) {
    return c.json({
      code: 40001,
      message: 'Authentication failed. Access token is missing.',
    }, 401);
  }

  const body = await c.req.json();
  const pixelId = body.pixel_id;
  const events = body.data || [];
  const db = getDb(c);

  // Validate pixel exists
  if (pixelId) {
    const { data: pixel } = await db
      .from('mock_pixels')
      .select('id')
      .eq('platform', 'tiktok')
      .eq('pixel_id', pixelId)
      .single();

    if (!pixel) {
      return c.json({
        code: 40002,
        message: `Pixel ${pixelId} not found`,
      }, 400);
    }
  }

  // Collect all unique click IDs from events
  const allClickIds = events
    .map((e: Record<string, unknown>) => {
      const userData = e.user_data as Record<string, unknown> | undefined;
      return userData?.ttclid as string | null;
    })
    .filter((id: string | null): id is string => !!id);

  // Batch query all click IDs at once
  let validClickIds = new Set<string>();
  if (allClickIds.length > 0) {
    const { data: clicks } = await db
      .from('mock_clicks')
      .select('click_id')
      .eq('platform', 'tiktok')
      .in('click_id', allClickIds);
    if (clicks) {
      validClickIds = new Set(clicks.map((c: { click_id: string }) => c.click_id));
    }
  }

  const eventIds: string[] = [];
  const errors: Array<{ event_name: string; error: string }> = [];
  const postbackPromises: Promise<void>[] = [];

  for (const event of events) {
    if (!event.event_id) {
      errors.push({ event_name: event.event_name || 'unknown', error: 'event_id is required for deduplication' });
      continue;
    }

    // Validate ttclid exists in mock_clicks if provided
    const clickId = event.user_data?.ttclid || null;
    if (clickId && !validClickIds.has(clickId)) {
      errors.push({ event_name: event.event_name || 'unknown', error: `click_id '${clickId}' not found in mock_clicks` });
      continue;
    }

    const effectivePixelId = pixelId || 'unknown';
    const record = {
      platform: 'tiktok' as const,
      pixel_id: effectivePixelId,
      event_name: event.event_name,
      event_id: event.event_id,
      event_time: event.timestamp ? new Date(event.timestamp * 1000).toISOString() : new Date().toISOString(),
      click_id: event.user_data?.ttclid || null,
      hashed_email: event.user_data?.email || null,
      hashed_phone: event.user_data?.phone || null,
      client_ip: event.user_data?.ip || null,
      user_agent: event.user_data?.user_agent || null,
      value: event.properties?.value || null,
      currency: event.properties?.currency || null,
      transaction_id: event.properties?.order_id || null,
      request_payload: event,
    };

    const { error } = await db.from('mock_events').upsert(record, { onConflict: EVENT_UPSERT_CONFLICT });

    if (error) {
      errors.push({ event_name: event.event_name || 'unknown', error: error.message });
    } else {
      eventIds.push(event.event_id);
      postbackPromises.push(
        triggerPostbacks(db, { platform: 'tiktok', pixel_id: effectivePixelId, event_name: event.event_name, event_data: event })
      );
    }
  }

  // Trigger postbacks for successfully stored events
  await Promise.allSettled(postbackPromises);

  // If all events failed, return error
  if (errors.length === events.length && events.length > 0) {
    return c.json({
      code: 50000,
      message: 'All events failed to store',
      data: { errors },
    }, 500);
  }

  return c.json({
    code: 0,
    message: errors.length > 0 ? `${errors.length} event(s) failed` : 'OK',
    data: {
      event_ids: eventIds,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
});
