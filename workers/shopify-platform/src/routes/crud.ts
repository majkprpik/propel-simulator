import { Hono } from 'hono';
import { getDb, type AppType } from '../index';

export const crudRoutes = new Hono<AppType>();

function parsePagination(page: string | undefined, pageSize: string | undefined) {
  const p = Math.max(1, parseInt(page ?? '1', 10));
  const ps = Math.min(100, Math.max(1, parseInt(pageSize ?? '20', 10)));
  return { page: p, pageSize: ps, from: (p - 1) * ps, to: (p - 1) * ps + ps - 1 };
}

// ── Shops ──────────────────────────────────────────────────────────────────

crudRoutes.get('/api/shops', async (c) => {
  const db = getDb(c);
  const { data, error } = await db
    .from('mock_shopify_shops')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data, total: data?.length ?? 0 });
});

crudRoutes.post('/api/shops', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  if (!body.shop_domain) {
    return c.json({ error: 'shop_domain is required' }, 400);
  }
  const record = {
    shop_domain: body.shop_domain,
    access_token: body.access_token || 'mock-shopify-token',
    webhook_secret: body.webhook_secret || 'mock-webhook-secret',
    status: body.status || 'active',
  };
  const { data, error } = await db.from('mock_shopify_shops').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/shops/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.shop_domain !== undefined) updates.shop_domain = body.shop_domain;
  if (body.access_token !== undefined) updates.access_token = body.access_token;
  if (body.webhook_secret !== undefined) updates.webhook_secret = body.webhook_secret;
  if (body.status !== undefined) updates.status = body.status;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_shopify_shops')
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

crudRoutes.delete('/api/shops/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_shopify_shops')
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

// ── Orders ─────────────────────────────────────────────────────────────────

crudRoutes.get('/api/orders', async (c) => {
  const db = getDb(c);
  const pag = parsePagination(c.req.query('page'), c.req.query('page_size'));
  const { data, count, error } = await db
    .from('mock_shopify_orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pag.from, pag.to);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [], total: count ?? 0, page: pag.page, pageSize: pag.pageSize });
});

crudRoutes.post('/api/orders', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  if (!body.order_id || !body.order_number) {
    return c.json({ error: 'order_id and order_number are required' }, 400);
  }
  const record = {
    shop_domain: body.shop_domain || null,
    order_id: body.order_id,
    order_number: body.order_number,
    email: body.email || null,
    total_price: body.total_price ?? 0.0,
    currency: body.currency || 'USD',
    checkout_token: body.checkout_token || null,
    landing_site: body.landing_site || null,
    referring_site: body.referring_site || null,
    source_name: body.source_name || 'web',
    financial_status: body.financial_status || 'paid',
    line_items: body.line_items || [],
    customer: body.customer || {},
  };
  const { data, error } = await db.from('mock_shopify_orders').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

crudRoutes.put('/api/orders/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.email !== undefined) updates.email = body.email;
  if (body.total_price !== undefined) updates.total_price = body.total_price;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.checkout_token !== undefined) updates.checkout_token = body.checkout_token;
  if (body.landing_site !== undefined) updates.landing_site = body.landing_site;
  if (body.referring_site !== undefined) updates.referring_site = body.referring_site;
  if (body.source_name !== undefined) updates.source_name = body.source_name;
  if (body.financial_status !== undefined) updates.financial_status = body.financial_status;
  if (body.line_items !== undefined) updates.line_items = body.line_items;
  if (body.customer !== undefined) updates.customer = body.customer;
  if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
  const { data, error } = await db
    .from('mock_shopify_orders')
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

crudRoutes.delete('/api/orders/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { data, error } = await db
    .from('mock_shopify_orders')
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

// ── Fire Webhook ───────────────────────────────────────────────────────────

crudRoutes.post('/api/orders/:id/fire-webhook', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();

  if (!body.target_url) {
    return c.json({ error: 'target_url is required' }, 400);
  }

  // Fetch the order
  const { data: order, error: orderError } = await db
    .from('mock_shopify_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) {
    if (orderError.code === 'PGRST116') return c.json({ error: 'Order not found' }, 404);
    return c.json({ error: orderError.message }, 500);
  }

  // Build Shopify-shaped order/paid payload
  const payload = {
    id: order.order_id,
    order_number: order.order_number,
    email: order.email,
    total_price: String(order.total_price),
    currency: order.currency,
    checkout_token: order.checkout_token,
    landing_site: order.landing_site,
    referring_site: order.referring_site,
    source_name: order.source_name,
    financial_status: 'paid',
    created_at: order.created_at,
    line_items: typeof order.line_items === 'string' ? JSON.parse(order.line_items) : order.line_items,
    customer: typeof order.customer === 'string' ? JSON.parse(order.customer) : order.customer,
  };

  // POST to target_url
  let responseStatus: number;
  let responseBody: string;
  try {
    const webhookRes = await fetch(body.target_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'orders/paid',
        'X-Shopify-Shop-Domain': order.shop_domain || '',
        'X-Shopify-Webhook-Id': crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    });
    responseStatus = webhookRes.status;
    responseBody = await webhookRes.text();
  } catch (err) {
    responseStatus = 0;
    responseBody = err instanceof Error ? err.message : 'Unknown error';
  }

  // Store in webhook log
  await db.from('mock_shopify_webhook_log').insert({
    order_id: order.order_id,
    shop_domain: order.shop_domain,
    target_url: body.target_url,
    topic: 'orders/paid',
    payload,
    response_status: responseStatus,
    response_body: responseBody,
  });

  // Update order with webhook info
  await db
    .from('mock_shopify_orders')
    .update({
      webhook_fired_at: new Date().toISOString(),
      webhook_target_url: body.target_url,
    })
    .eq('id', id);

  return c.json({ ok: true, status: responseStatus, body: responseBody });
});

// ── Webhook Log ────────────────────────────────────────────────────────────

crudRoutes.get('/api/webhook-log', async (c) => {
  const db = getDb(c);
  const { data, error } = await db
    .from('mock_shopify_webhook_log')
    .select('*')
    .order('fired_at', { ascending: false })
    .limit(50);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data: data ?? [], total: data?.length ?? 0 });
});

crudRoutes.delete('/api/webhook-log', async (c) => {
  const db = getDb(c);
  const { error } = await db
    .from('mock_shopify_webhook_log')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ status: 'cleared' });
});
