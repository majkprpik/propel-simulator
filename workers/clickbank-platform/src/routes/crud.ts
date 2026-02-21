import { Hono } from 'hono';
import { getDb, type AppType } from '../index';

export const crudRoutes = new Hono<AppType>();

function generateReceipt(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');
  return `CB-${dateStr}-${hex}`;
}

function generateOrderId(): string {
  const digits = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) =>
    (b % 10).toString()
  ).join('');
  return digits;
}

function parsePagination(page: string | undefined, pageSize: string | undefined) {
  const p = Math.max(1, parseInt(page ?? '1', 10));
  const pp = Math.min(100, Math.max(1, parseInt(pageSize ?? '20', 10)));
  return { page: p, pageSize: pp, from: (p - 1) * pp, to: (p - 1) * pp + pp - 1 };
}

// ── Accounts ──────────────────────────────────────────────────────────────

crudRoutes.get('/api/accounts', async (c) => {
  const db = getDb(c);
  const { data, error } = await db
    .from('mock_cb_accounts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data, total: data?.length ?? 0 });
});

crudRoutes.post('/api/accounts', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  if (!body.nickname) {
    return c.json({ error: 'nickname is required' }, 400);
  }
  const record = {
    nickname: body.nickname,
    api_key: body.api_key || 'mock-cb-api-key',
    dev_key: body.dev_key || 'mock-cb-dev-key',
    status: body.status || 'active',
  };
  const { data, error } = await db.from('mock_cb_accounts').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/accounts/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.nickname !== undefined) updates.nickname = body.nickname;
  if (body.status !== undefined) updates.status = body.status;
  if (body.api_key !== undefined) updates.api_key = body.api_key;
  if (body.dev_key !== undefined) updates.dev_key = body.dev_key;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_cb_accounts')
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

crudRoutes.delete('/api/accounts/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_cb_accounts')
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

// ── Products ──────────────────────────────────────────────────────────────

crudRoutes.get('/api/products', async (c) => {
  const db = getDb(c);
  const pag = parsePagination(c.req.query('page'), c.req.query('page_size'));
  const { data, count, error } = await db
    .from('mock_cb_products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pag.from, pag.to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [], total: count ?? 0, page: pag.page, pageSize: pag.pageSize });
});

crudRoutes.post('/api/products', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  if (!body.site || !body.item || !body.title || !body.hoplink || !body.account_id) {
    return c.json({ error: 'account_id, site, item, title, and hoplink are required' }, 400);
  }
  const record = {
    account_id: body.account_id,
    site: body.site,
    item: body.item,
    title: body.title,
    description: body.description || null,
    price: body.price ?? 37.0,
    currency: body.currency || 'USD',
    category: body.category || 'HEALTH',
    gravity: body.gravity ?? 50.0,
    commission_rate: body.commission_rate ?? 75.0,
    hoplink: body.hoplink,
    status: body.status || 'active',
  };
  const { data, error } = await db.from('mock_cb_products').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/products/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.site !== undefined) updates.site = body.site;
  if (body.item !== undefined) updates.item = body.item;
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.price !== undefined) updates.price = body.price;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.category !== undefined) updates.category = body.category;
  if (body.gravity !== undefined) updates.gravity = body.gravity;
  if (body.commission_rate !== undefined) updates.commission_rate = body.commission_rate;
  if (body.hoplink !== undefined) updates.hoplink = body.hoplink;
  if (body.status !== undefined) updates.status = body.status;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_cb_products')
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

crudRoutes.delete('/api/products/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_cb_products')
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

// ── Orders ────────────────────────────────────────────────────────────────

crudRoutes.get('/api/orders', async (c) => {
  const db = getDb(c);
  const pag = parsePagination(c.req.query('page'), c.req.query('page_size'));
  const { data, count, error } = await db
    .from('mock_cb_orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pag.from, pag.to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [], total: count ?? 0, page: pag.page, pageSize: pag.pageSize });
});

crudRoutes.post('/api/orders', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  if (!body.amount) {
    return c.json({ error: 'amount is required' }, 400);
  }
  const record = {
    account_id: body.account_id || null,
    receipt: body.receipt || generateReceipt(),
    cb_order_id: body.cb_order_id || generateOrderId(),
    product_site: body.product_site || null,
    product_item: body.product_item || null,
    affiliate_id: body.affiliate_id || null,
    amount: body.amount,
    currency: body.currency || 'USD',
    customer_email: body.customer_email || null,
    status: body.status || 'SALE',
    cbpop: body.cbpop || null,
  };
  const { data, error } = await db.from('mock_cb_orders').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.delete('/api/orders/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_cb_orders')
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
  const { data, error } = await db
    .from('mock_cb_postbacks')
    .select('*')
    .order('received_at', { ascending: false })
    .limit(50);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [], total: data?.length ?? 0 });
});

crudRoutes.delete('/api/postbacks', async (c) => {
  const db = getDb(c);
  const { error } = await db.from('mock_cb_postbacks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ status: 'cleared' });
});

// ── Postback Configs ──────────────────────────────────────────────────────

crudRoutes.get('/api/postback-configs', async (c) => {
  const db = getDb(c);
  const { data, error } = await db
    .from('mock_cb_postback_configs')
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
    event_name: body.event_name || 'sale',
    is_active: body.is_active ?? true,
  };
  const { data, error } = await db.from('mock_cb_postback_configs').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.delete('/api/postback-configs/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_cb_postback_configs')
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
