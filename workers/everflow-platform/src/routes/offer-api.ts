import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';

export const offerApiRoutes = new Hono<AppType>();

// POST /v1/networks/offerstable — What Propel's affiliate-sync calls
offerApiRoutes.post('/v1/networks/offerstable', async (c) => {
  if (testState.errorModeEnabled) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }

  // Validate API key
  const apiKey = c.req.header('X-Eflow-API-Key');
  if (!apiKey) {
    return c.json({ error: 'Missing X-Eflow-API-Key header' }, 401);
  }

  const db = getDb(c);

  const { data: account, error: accountError } = await db
    .from('mock_ef_accounts')
    .select('*')
    .eq('api_key', apiKey)
    .eq('status', 'active')
    .single();

  if (accountError || !account) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  // Parse pagination and filters from request
  const page = Number(c.req.query('page') ?? 1);
  const pageSize = Number(c.req.query('page_size') ?? 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let body: { filters?: { offer_status?: string } } = {};
  try {
    body = await c.req.json();
  } catch {
    // body is optional
  }

  const statusFilter = body?.filters?.offer_status ?? 'active';

  let query = db
    .from('mock_ef_offers')
    .select('*', { count: 'exact' })
    .eq('account_id', account.account_id)
    .order('network_offer_id', { ascending: true })
    .range(from, to);

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: offers, count, error } = await query;
  if (error) return c.json({ error: error.message }, 500);

  // Map to Everflow API response shape
  const mappedOffers = (offers ?? []).map((o) => ({
    network_offer_id: o.network_offer_id,
    offer_id: o.offer_id,
    name: o.name,
    tracking_url: o.tracking_url,
    preview_url: o.preview_url,
    payout: o.payout,
    payout_type: o.payout_type,
    currency_id: o.currency_id,
    status: o.status,
    description: o.description,
    require_approval: o.require_approval,
    click_cookie_days: o.click_cookie_days,
  }));

  return c.json({
    offers: mappedOffers,
    total_count: count ?? 0,
  });
});
