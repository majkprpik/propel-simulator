import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';

export const offerApiRoutes = new Hono<AppType>();

// GET /api/1/offers.json?api_key={key}&offer_status_id=1 — Cake's offer API
offerApiRoutes.get('/api/1/offers.json', async (c) => {
  if (testState.errorModeEnabled) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }

  // Validate API key
  const apiKey = c.req.query('api_key');
  if (!apiKey) {
    return c.json({ error: 'Missing api_key parameter' }, 401);
  }

  const db = getDb(c);

  const { data: account, error: accountError } = await db
    .from('mock_cake_accounts')
    .select('*')
    .eq('api_key', apiKey)
    .eq('status', 'active')
    .single();

  if (accountError || !account) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  // Parse offer_status_id filter: 1=active, 2=paused, 3=inactive
  const offerStatusId = c.req.query('offer_status_id');
  const statusMap: Record<string, string> = { '1': 'active', '2': 'paused', '3': 'inactive' };

  let query = db
    .from('mock_cake_offers')
    .select('*')
    .eq('account_id', account.account_id)
    .order('offer_id', { ascending: true });

  if (offerStatusId && statusMap[offerStatusId]) {
    query = query.eq('status', statusMap[offerStatusId]);
  }

  const { data: offers, error } = await query;
  if (error) return c.json({ error: error.message }, 500);

  // Map to Cake API response shape — numeric-keyed object (NOT array)
  const result: Record<string, unknown> = {};
  (offers ?? []).forEach((o, index) => {
    result[String(index)] = {
      offer_id: o.offer_id,
      offer_name: o.offer_name,
      offer_status_id: o.offer_status_id,
      hidden: false,
      offer_contract_id: 1,
      price_format_id: o.price_format_id,
      received: 0,
      price: Number(o.price),
      offer_link: o.offer_link,
      thankyou_link: o.thankyou_link,
      preview_link: o.preview_link,
    };
  });

  return c.json(result);
});
