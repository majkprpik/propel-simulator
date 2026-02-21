import { Hono } from 'hono';
import { getDb, type AppType } from '../index';

export const postbackConfigRoutes = new Hono<AppType>();

const PLATFORM = 'newsbreak';

// List all postback configs
postbackConfigRoutes.get('/api/postback-configs', async (c) => {
  const db = getDb(c);
  const { data, error } = await db
    .from('mock_postback_configs')
    .select('*')
    .eq('platform', PLATFORM)
    .order('created_at', { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data, total: data?.length ?? 0 });
});

// Create a new postback config
postbackConfigRoutes.post('/api/postback-configs', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const record = {
    platform: PLATFORM,
    name: body.name,
    ad_account_id: body.ad_account_id,
    event_name: body.event_name,
    postback_url: body.postback_url,
    is_active: true,
  };
  const { data, error } = await db.from('mock_postback_configs').insert(record).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data }, 201);
});

// Update a postback config
postbackConfigRoutes.put('/api/postback-configs/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.event_name !== undefined) updates.event_name = body.event_name;
  if (body.postback_url !== undefined) updates.postback_url = body.postback_url;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  const { data, error } = await db
    .from('mock_postback_configs')
    .update(updates)
    .eq('id', id)
    .eq('platform', PLATFORM)
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ data });
});

// Delete a postback config
postbackConfigRoutes.delete('/api/postback-configs/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const { error } = await db
    .from('mock_postback_configs')
    .delete()
    .eq('id', id)
    .eq('platform', PLATFORM);
  if (error) return c.json({ error: error.message }, 500);
  return c.body(null, 204);
});
