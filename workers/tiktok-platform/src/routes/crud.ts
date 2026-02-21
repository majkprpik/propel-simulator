import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';
import { generateTtclid } from '../../../../shared/utils/click-id-generator';
import { parsePagination, paginationRange, buildPaginatedResponse } from '../../../../shared/utils/pagination';
import { createCrudRateLimiter } from '../../../../shared/utils/rate-limiter';
import {
  createAccountSchema,
  createCampaignSchema,
  createAdGroupSchema,
  createAdSchema,
  createPixelSchema,
  generateClickSchema,
  formatZodErrors,
} from '../../../../shared/types/validation';

export const crudRoutes = new Hono<AppType>();

const PLATFORM = 'tiktok';

// Rate-limit write operations (POST/PUT/DELETE) on CRUD endpoints
crudRoutes.use('*', createCrudRateLimiter({ isForceEnabled: () => testState.crudRateLimitEnabled }));

// Accounts
crudRoutes.get('/api/accounts', async (c) => {
  const db = getDb(c);
  const pag = parsePagination({ page: c.req.query('page'), perPage: c.req.query('perPage') });
  const [from, to] = paginationRange(pag);
  const { data, count, error } = await db
    .from('mock_ad_accounts')
    .select('*', { count: 'exact' })
    .eq('platform', PLATFORM)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(buildPaginatedResponse(data ?? [], count ?? 0, pag));
});

crudRoutes.post('/api/accounts', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const parsed = createAccountSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: formatZodErrors(parsed.error) }, 400);
  }
  const record = {
    platform: PLATFORM,
    account_id: parsed.data.account_id || `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    name: parsed.data.name,
    currency: parsed.data.currency || 'USD',
    status: parsed.data.status || 'active',
  };
  const { data, error } = await db.from('mock_ad_accounts').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/accounts/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.status !== undefined) updates.status = body.status;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_ad_accounts')
    .update(updates)
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

crudRoutes.delete('/api/accounts/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_ad_accounts')
    .delete()
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

// Campaigns
crudRoutes.get('/api/campaigns', async (c) => {
  const db = getDb(c);
  const pag = parsePagination({ page: c.req.query('page'), perPage: c.req.query('perPage') });
  const [from, to] = paginationRange(pag);
  const { data, count, error } = await db
    .from('mock_campaigns')
    .select('*', { count: 'exact' })
    .eq('platform', PLATFORM)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(buildPaginatedResponse(data ?? [], count ?? 0, pag));
});

crudRoutes.post('/api/campaigns', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const parsed = createCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: formatZodErrors(parsed.error) }, 400);
  }
  const record = {
    platform: PLATFORM,
    ad_account_id: parsed.data.ad_account_id,
    campaign_id: parsed.data.campaign_id || `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    name: parsed.data.name,
    objective: parsed.data.objective || 'WEBSITE_CONVERSIONS',
    status: parsed.data.status || 'ENABLE',
    daily_budget: parsed.data.daily_budget || null,
  };
  const { data, error } = await db.from('mock_campaigns').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/campaigns/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.objective !== undefined) updates.objective = body.objective;
  if (body.status !== undefined) updates.status = body.status;
  if (body.daily_budget !== undefined) updates.daily_budget = body.daily_budget;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_campaigns')
    .update(updates)
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

crudRoutes.delete('/api/campaigns/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_campaigns')
    .delete()
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

// Ad Groups
crudRoutes.get('/api/ad-groups', async (c) => {
  const db = getDb(c);
  const pag = parsePagination({ page: c.req.query('page'), perPage: c.req.query('perPage') });
  const [from, to] = paginationRange(pag);
  const { data, count, error } = await db
    .from('mock_ad_groups')
    .select('*', { count: 'exact' })
    .eq('platform', PLATFORM)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(buildPaginatedResponse(data ?? [], count ?? 0, pag));
});

crudRoutes.post('/api/ad-groups', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const parsed = createAdGroupSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: formatZodErrors(parsed.error) }, 400);
  }
  const record = {
    platform: PLATFORM,
    campaign_id: parsed.data.campaign_id,
    ad_group_id: parsed.data.ad_group_id || `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    name: parsed.data.name,
    status: parsed.data.status || 'ENABLE',
    bid_amount: parsed.data.bid_amount || null,
  };
  const { data, error } = await db.from('mock_ad_groups').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/ad-groups/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.status !== undefined) updates.status = body.status;
  if (body.bid_amount !== undefined) updates.bid_amount = body.bid_amount;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_ad_groups')
    .update(updates)
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

crudRoutes.delete('/api/ad-groups/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_ad_groups')
    .delete()
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

// Ads
crudRoutes.get('/api/ads', async (c) => {
  const db = getDb(c);
  const status = c.req.query('status');
  const pag = parsePagination({ page: c.req.query('page'), perPage: c.req.query('perPage') });
  const [from, to] = paginationRange(pag);
  let query = db
    .from('mock_ads')
    .select('*', { count: 'exact' })
    .eq('platform', PLATFORM)
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, count, error } = await query.range(from, to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(buildPaginatedResponse(data ?? [], count ?? 0, pag));
});

crudRoutes.post('/api/ads', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const parsed = createAdSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: formatZodErrors(parsed.error) }, 400);
  }
  const record = {
    platform: PLATFORM,
    ad_group_id: parsed.data.ad_group_id || null,
    ad_id: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    name: parsed.data.name,
    destination_url: parsed.data.destination_url || null,
    status: parsed.data.status || 'ENABLE',
  };
  const { data, error } = await db.from('mock_ads').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/ads/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.destination_url !== undefined) updates.destination_url = body.destination_url;
  if (body.status !== undefined) updates.status = body.status;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_ads')
    .update(updates)
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

crudRoutes.delete('/api/ads/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_ads')
    .delete()
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

// Pixels
crudRoutes.get('/api/pixels', async (c) => {
  const db = getDb(c);
  const pag = parsePagination({ page: c.req.query('page'), perPage: c.req.query('perPage') });
  const [from, to] = paginationRange(pag);
  const { data, count, error } = await db
    .from('mock_pixels')
    .select('*', { count: 'exact' })
    .eq('platform', PLATFORM)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(buildPaginatedResponse(data ?? [], count ?? 0, pag));
});

crudRoutes.post('/api/pixels', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const parsed = createPixelSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: formatZodErrors(parsed.error) }, 400);
  }
  const record = {
    platform: PLATFORM,
    ad_account_id: parsed.data.ad_account_id,
    pixel_id: parsed.data.pixel_id || `C${Math.random().toString().slice(2, 22)}`,
    name: parsed.data.name,
    access_token: parsed.data.access_token || `tt_mock_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`,
    status: parsed.data.status || 'active',
  };
  const { data, error } = await db.from('mock_pixels').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/pixels/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.access_token !== undefined) updates.access_token = body.access_token;
  if (body.status !== undefined) updates.status = body.status;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_pixels')
    .update(updates)
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

crudRoutes.delete('/api/pixels/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_pixels')
    .delete()
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

// Events
crudRoutes.get('/api/events', async (c) => {
  const db = getDb(c);
  const pixelId = c.req.query('pixel_id');
  const pag = parsePagination({ page: c.req.query('page'), perPage: c.req.query('perPage') });
  const [from, to] = paginationRange(pag);
  let query = db
    .from('mock_events')
    .select('*', { count: 'exact' })
    .eq('platform', PLATFORM)
    .order('received_at', { ascending: false });
  if (pixelId) query = query.eq('pixel_id', pixelId);
  const { data, count, error } = await query.range(from, to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(buildPaginatedResponse(data ?? [], count ?? 0, pag));
});

// Clicks
crudRoutes.get('/api/clicks', async (c) => {
  const db = getDb(c);
  const pag = parsePagination({ page: c.req.query('page'), perPage: c.req.query('perPage') });
  const [from, to] = paginationRange(pag);
  const { data, count, error } = await db
    .from('mock_clicks')
    .select('*', { count: 'exact' })
    .eq('platform', PLATFORM)
    .order('clicked_at', { ascending: false })
    .range(from, to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(buildPaginatedResponse(data ?? [], count ?? 0, pag));
});

crudRoutes.post('/api/clicks/generate', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const parsed = generateClickSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: formatZodErrors(parsed.error) }, 400);
  }
  const record = {
    platform: PLATFORM,
    click_id: generateTtclid(),
    campaign_id: parsed.data.campaign_id || null,
    ad_group_id: parsed.data.ad_group_id || null,
    ad_id: parsed.data.ad_id || null,
    destination_url: parsed.data.destination_url || 'https://example.com',
  };
  const { data, error } = await db.from('mock_clicks').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});
