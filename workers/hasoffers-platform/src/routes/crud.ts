import { Hono } from 'hono';
import { getDb, type AppType } from '../index';

export const crudRoutes = new Hono<AppType>();

function generateClickId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ho_${hex}`;
}

function parsePagination(page: string | undefined, perPage: string | undefined) {
  const p = Math.max(1, parseInt(page ?? '1', 10));
  const pp = Math.min(100, Math.max(1, parseInt(perPage ?? '20', 10)));
  return { page: p, perPage: pp, from: (p - 1) * pp, to: (p - 1) * pp + pp - 1 };
}

// ── Accounts ──────────────────────────────────────────────────────────────

crudRoutes.get('/api/accounts', async (c) => {
  const db = getDb(c);
  const { data, error } = await db
    .from('mock_ho_accounts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data, total: data?.length ?? 0 });
});

crudRoutes.post('/api/accounts', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  if (!body.name || !body.network_id) {
    return c.json({ error: 'name and network_id are required' }, 400);
  }
  const record = {
    account_id: body.account_id || `ho_${crypto.randomUUID().slice(0, 8)}`,
    name: body.name,
    network_id: body.network_id,
    api_key: body.api_key || 'mock-ho-network-token',
    status: body.status || 'active',
  };
  const { data, error } = await db.from('mock_ho_accounts').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/accounts/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.status !== undefined) updates.status = body.status;
  if (body.api_key !== undefined) updates.api_key = body.api_key;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_ho_accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

// ── Offers ────────────────────────────────────────────────────────────────

crudRoutes.get('/api/offers', async (c) => {
  const db = getDb(c);
  const pag = parsePagination(c.req.query('page'), c.req.query('perPage'));
  const { data, count, error } = await db
    .from('mock_ho_offers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pag.from, pag.to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [], total: count ?? 0, page: pag.page, perPage: pag.perPage });
});

crudRoutes.post('/api/offers', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  if (!body.name || !body.offer_url || !body.account_id) {
    return c.json({ error: 'name, offer_url, and account_id are required' }, 400);
  }
  const offerId = body.offer_id || Math.floor(Math.random() * 900000) + 100000;
  const record = {
    account_id: body.account_id,
    offer_id: offerId,
    name: body.name,
    offer_url: body.offer_url,
    preview_url: body.preview_url || 'https://example.com/preview',
    default_payout: body.default_payout ?? 5.00,
    default_payout_type: body.default_payout_type || 'cpa_flat',
    currency: body.currency || 'USD',
    status: body.status || 'active',
    description: body.description || null,
  };
  const { data, error } = await db.from('mock_ho_offers').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/offers/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.offer_url !== undefined) updates.offer_url = body.offer_url;
  if (body.preview_url !== undefined) updates.preview_url = body.preview_url;
  if (body.default_payout !== undefined) updates.default_payout = body.default_payout;
  if (body.default_payout_type !== undefined) updates.default_payout_type = body.default_payout_type;
  if (body.status !== undefined) updates.status = body.status;
  if (body.description !== undefined) updates.description = body.description;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_ho_offers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

crudRoutes.delete('/api/offers/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_ho_offers')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

// ── Clicks ────────────────────────────────────────────────────────────────

crudRoutes.get('/api/clicks', async (c) => {
  const db = getDb(c);
  const pag = parsePagination(c.req.query('page'), c.req.query('perPage'));
  const { data, count, error } = await db
    .from('mock_ho_clicks')
    .select('*, mock_ho_offers(name)', { count: 'exact' })
    .order('clicked_at', { ascending: false })
    .range(pag.from, pag.to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [], total: count ?? 0, page: pag.page, perPage: pag.perPage });
});

crudRoutes.post('/api/clicks/generate', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const count = Math.min(100, Math.max(1, Number(body.count ?? 1)));
  const offerId: number | null = body.offer_id || null;

  // Verify offer exists if specified
  if (offerId) {
    const { data: offer } = await db
      .from('mock_ho_offers')
      .select('offer_id, offer_url')
      .eq('offer_id', offerId)
      .single();
    if (!offer) return c.json({ error: 'Offer not found' }, 404);
  }

  const clicks = Array.from({ length: count }, () => ({
    click_id: generateClickId(),
    offer_id: offerId,
    affiliate_id: body.affiliate_id || `aff_${Math.floor(Math.random() * 9000) + 1000}`,
    destination_url: body.destination_url || 'https://example.com/lander',
    ip_address: body.ip_address || '1.2.3.4',
    user_agent: body.user_agent || 'Mozilla/5.0 (Simulator)',
    converted: false,
  }));

  const { data, error } = await db.from('mock_ho_clicks').insert(clicks).select();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data, generated: count }, 201);
});

crudRoutes.delete('/api/clicks/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_ho_clicks')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});

// ── Postbacks ─────────────────────────────────────────────────────────────

crudRoutes.get('/api/postbacks', async (c) => {
  const db = getDb(c);
  const pag = parsePagination(c.req.query('page'), c.req.query('perPage'));
  const { data, count, error } = await db
    .from('mock_ho_postbacks')
    .select('*', { count: 'exact' })
    .order('received_at', { ascending: false })
    .range(pag.from, pag.to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [], total: count ?? 0, page: pag.page, perPage: pag.perPage });
});

crudRoutes.delete('/api/postbacks', async (c) => {
  const db = getDb(c);
  const { error } = await db.from('mock_ho_postbacks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ status: 'cleared' });
});

// ── Postback Configs ──────────────────────────────────────────────────────

crudRoutes.get('/api/postback-configs', async (c) => {
  const db = getDb(c);
  const { data, error } = await db
    .from('mock_ho_postback_configs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [], total: data?.length ?? 0 });
});

crudRoutes.post('/api/postback-configs', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  if (!body.name || !body.postback_url) {
    return c.json({ error: 'name and postback_url are required' }, 400);
  }
  const record = {
    account_id: body.account_id || null,
    name: body.name,
    postback_url: body.postback_url,
    event_name: body.event_name || 'conversion',
    is_active: body.is_active ?? true,
  };
  const { data, error } = await db.from('mock_ho_postback_configs').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.delete('/api/postback-configs/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_ho_postback_configs')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return c.json({ error: 'Not found' }, 404);
    return c.json({ error: error.message }, 500);
  }
  return c.json({ data });
});
