import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';
import { triggerPostbacks } from '../../../../shared/utils/postbacks';
import { normalizeCurrency } from '../../../../shared/utils/currency';

export const conversionRoutes = new Hono<AppType>();

// Google Ads Conversion Upload API
// POST /v17/customers/:customer_id:uploadClickConversions
conversionRoutes.post('/v17/customers/:customer_id\\:uploadClickConversions', async (c) => {
  // Rate limit check
  if (testState.rateLimitEnabled) {
    return c.json({
      error: {
        code: 429,
        message: 'Resource has been exhausted',
        status: 'RESOURCE_EXHAUSTED',
      },
    }, 429);
  }

  // Validate auth headers
  const developerToken = c.req.header('developer-token');
  const authorization = c.req.header('Authorization');

  if (!developerToken) {
    return c.json({
      error: {
        code: 401,
        message: 'Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential.',
        status: 'UNAUTHENTICATED',
      },
    }, 401);
  }

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({
      error: {
        code: 401,
        message: 'Request had invalid authentication credentials.',
        status: 'UNAUTHENTICATED',
      },
    }, 401);
  }

  const customerId = c.req.param('customer_id');
  const db = getDb(c);
  const body = await c.req.json();
  const conversions = body.conversions || [];
  const results: Array<{ conversionDateTime: string }> = [];
  const errors: Array<{ index: number; error: string }> = [];
  const postbackPromises: Promise<void>[] = [];

  for (let i = 0; i < conversions.length; i++) {
    const conversion = conversions[i];

    // Validate gclid exists in mock_clicks if provided
    const clickId = conversion.gclid || null;
    if (clickId) {
      const { data: click } = await db
        .from('mock_clicks')
        .select('id')
        .eq('platform', 'google')
        .eq('click_id', clickId)
        .single();

      if (!click) {
        errors.push({ index: i, error: `gclid '${clickId}' not found in mock_clicks` });
        continue;
      }
    }

    // Use orderId as event_id for deduplication (Google's standard dedup key)
    const eventId = conversion.orderId || conversion.event_id;
    if (!eventId) {
      errors.push({ index: i, error: 'orderId or event_id is required for deduplication' });
      continue;
    }

    const pixelId = conversion.conversionAction || customerId;
    const record = {
      platform: 'google' as const,
      pixel_id: pixelId,
      event_name: 'conversion',
      event_id: eventId,
      event_time: conversion.conversionDateTime || new Date().toISOString(),
      click_id: conversion.gclid || null,
      value: conversion.conversionValue || null,
      currency: conversion.currencyCode || null,
      transaction_id: conversion.orderId || null,
      request_payload: conversion,
    };

    const { error } = await db.from('mock_events').upsert(record, { onConflict: 'platform,event_id' });

    if (error) {
      errors.push({ index: i, error: error.message });
    } else {
      results.push({ conversionDateTime: conversion.conversionDateTime });
      postbackPromises.push(
        triggerPostbacks(db, { platform: 'google', pixel_id: pixelId, event_name: 'conversion', event_data: conversion })
      );
    }
  }

  // Trigger postbacks for successfully stored conversions
  await Promise.allSettled(postbackPromises);

  // If all conversions failed, return error
  if (errors.length === conversions.length && conversions.length > 0) {
    return c.json({
      error: {
        code: 500,
        message: 'All conversions failed to store',
        status: 'INTERNAL',
        details: errors,
      },
    }, 500);
  }

  return c.json({
    results,
    partialFailureError: errors.length > 0 ? { message: `${errors.length} conversion(s) failed`, errors } : null,
  });
});
