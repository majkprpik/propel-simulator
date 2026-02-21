import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';

export const productApiRoutes = new Hono<AppType>();

// GET /1/products — What Propel's affiliate-sync calls to get ClickBank product data
productApiRoutes.get('/1/products', async (c) => {
  if (testState.errorModeEnabled) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }

  const site = c.req.query('site');
  const apiKey = c.req.query('apiKey');
  const devKey = c.req.query('devKey');

  if (!apiKey) {
    return c.json({ error: 'Missing apiKey parameter' }, 401);
  }

  const db = getDb(c);

  // Validate API key against mock_cb_accounts
  const { data: account, error: accountError } = await db
    .from('mock_cb_accounts')
    .select('*')
    .eq('api_key', apiKey)
    .eq('status', 'active')
    .single();

  if (accountError || !account) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  // Query products for this account
  let query = db
    .from('mock_cb_products')
    .select('*')
    .eq('account_id', account.account_id)
    .order('created_at', { ascending: false });

  if (site) {
    query = query.eq('site', site);
  }

  const activeFilter = c.req.query('active');
  if (activeFilter === 'true') {
    query = query.eq('status', 'active');
  }

  const { data: products, error } = await query;
  if (error) return c.json({ error: error.message }, 500);

  // Map to ClickBank API response shape (prices in cents)
  const mappedProducts = (products ?? []).map((p) => ({
    site: p.site,
    item: p.item,
    title: p.title,
    description: p.description,
    price: { amount: Math.round(Number(p.price) * 100), currency: p.currency },
    gravity: Number(p.gravity),
    commission: { percentage: Number(p.commission_rate) },
    hoplink: p.hoplink,
    active: p.status === 'active',
  }));

  return c.json({ products: mappedProducts });
});
