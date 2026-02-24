import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';
import { triggerPostbacks } from '../../../../shared/utils/postbacks';
import { EVENT_UPSERT_CONFLICT } from '../../../../shared/utils/crud-factory';

export const capiRoutes = new Hono<AppType>();

// Snapchat CAPI: POST /v2/conversion
capiRoutes.post('/v2/conversion', async (c) => {
  // Rate limit check
  if (testState.rateLimitEnabled) {
    return c.json({
      status: 'error',
      request_id: `mock-${crypto.randomUUID().slice(0, 8)}`,
      error: 'Rate limit exceeded',
    }, 429);
  }

  // Validate Authorization: Bearer
  const authorization = c.req.header('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({
      status: 'error',
      request_id: `mock-${crypto.randomUUID().slice(0, 8)}`,
      error: 'Unauthorized: Missing or invalid Bearer token',
    }, 401);
  }

  const body = await c.req.json();
  const db = getDb(c);
  const requestId = `mock-${crypto.randomUUID().slice(0, 8)}`;

  // Validate pixel exists
  if (body.pixel_id) {
    const { data: pixel } = await db
      .from('mock_pixels')
      .select('id')
      .eq('platform', 'snapchat')
      .eq('pixel_id', body.pixel_id)
      .single();

    if (!pixel) {
      return c.json({
        status: 'error',
        request_id: requestId,
        error: `Pixel ${body.pixel_id} not found`,
      }, 400);
    }
  }

  // Validate click_id exists in mock_clicks if provided
  if (body.click_id) {
    const { data: click } = await db
      .from('mock_clicks')
      .select('id')
      .eq('platform', 'snapchat')
      .eq('click_id', body.click_id)
      .single();

    if (!click) {
      return c.json({
        status: 'error',
        request_id: requestId,
        error: `click_id '${body.click_id}' not found in mock_clicks`,
      }, 400);
    }
  }

  // Require event_id for deduplication
  if (!body.event_id) {
    return c.json({
      status: 'error',
      request_id: requestId,
      error: 'event_id is required for deduplication',
    }, 400);
  }

  // Store event (upsert for idempotency)
  const record = {
    platform: 'snapchat' as const,
    pixel_id: body.pixel_id || 'unknown',
    event_name: body.event || 'CUSTOM',
    event_id: body.event_id,
    event_time: body.timestamp ? new Date(body.timestamp * 1000).toISOString() : new Date().toISOString(),
    click_id: body.click_id || null,
    hashed_email: body.hashed_email || null,
    hashed_phone: body.hashed_phone || null,
    client_ip: body.ip_address || null,
    user_agent: body.user_agent || null,
    value: body.price ? parseFloat(body.price) : null,
    currency: body.currency || null,
    transaction_id: body.transaction_id || null,
    request_payload: body,
  };

  const { error } = await db.from('mock_events').upsert(record, { onConflict: EVENT_UPSERT_CONFLICT });

  if (error) {
    return c.json({
      status: 'error',
      request_id: requestId,
      error: `Failed to store event: ${error.message}`,
    }, 500);
  }

  // Trigger postbacks for the successfully stored event
  await triggerPostbacks(db, {
    platform: 'snapchat',
    pixel_id: body.pixel_id || 'unknown',
    event_name: body.event || 'CUSTOM',
    event_data: body,
  });

  return c.json({
    status: 'success',
    request_id: requestId,
  });
});
