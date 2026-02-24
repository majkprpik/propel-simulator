import { Hono } from 'hono';
import type { Context } from 'hono';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Platform } from '../types/database';
import type { WorkerAppType } from '../types/worker';
import { formatZodErrors } from '../types/validation';
import { parsePagination, paginationRange, buildPaginatedResponse } from './pagination';
import { SUPABASE_NOT_FOUND } from './crud-factory';

const createPostbackConfigSchema = z.object({
  name: z.string().min(1, 'name is required'),
  ad_account_id: z.string().min(1, 'ad_account_id is required'),
  event_name: z.string().min(1, 'event_name is required'),
  postback_url: z.string().url('postback_url must be a valid URL'),
});

export function createPostbackConfigRoutes(
  platform: Platform,
  getDb: (c: Context<WorkerAppType>) => SupabaseClient,
): Hono<WorkerAppType> {
  const routes = new Hono<WorkerAppType>();

  // List with pagination
  routes.get('/api/postback-configs', async (c) => {
    const db = getDb(c);
    const pag = parsePagination({ page: c.req.query('page'), perPage: c.req.query('perPage') });
    const [from, to] = paginationRange(pag);
    const { data, count, error } = await db
      .from('mock_postback_configs')
      .select('*', { count: 'exact' })
      .eq('platform', platform)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) return c.json({ error: error.message }, 500);
    return c.json(buildPaginatedResponse(data ?? [], count ?? 0, pag));
  });

  // Create with validation
  routes.post('/api/postback-configs', async (c) => {
    const db = getDb(c);
    const body = await c.req.json();
    const parsed = createPostbackConfigSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: formatZodErrors(parsed.error) }, 400);
    }
    const record = {
      platform,
      name: parsed.data.name,
      ad_account_id: parsed.data.ad_account_id,
      event_name: parsed.data.event_name,
      postback_url: parsed.data.postback_url,
      is_active: true,
    };
    const { data, error } = await db.from('mock_postback_configs').insert(record).select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data }, 201);
  });

  // Update with 404 handling
  routes.put('/api/postback-configs/:id', async (c) => {
    const db = getDb(c);
    const id = c.req.param('id');
    const body = await c.req.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.event_name !== undefined) updates.event_name = body.event_name;
    if (body.postback_url !== undefined) updates.postback_url = body.postback_url;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (Object.keys(updates).length === 0) return c.json({ error: 'No fields to update' }, 400);
    const { data, error } = await db
      .from('mock_postback_configs')
      .update(updates)
      .eq('id', id)
      .eq('platform', platform)
      .select()
      .single();
    if (error) {
      if (error.code === SUPABASE_NOT_FOUND) return c.json({ error: 'Not found' }, 404);
      return c.json({ error: error.message }, 500);
    }
    return c.json({ data });
  });

  // Delete with 404 handling
  routes.delete('/api/postback-configs/:id', async (c) => {
    const db = getDb(c);
    const id = c.req.param('id');
    const { data, error } = await db
      .from('mock_postback_configs')
      .delete()
      .eq('id', id)
      .eq('platform', platform)
      .select()
      .single();
    if (error) {
      if (error.code === SUPABASE_NOT_FOUND) return c.json({ error: 'Not found' }, 404);
      return c.json({ error: error.message }, 500);
    }
    return c.json({ data });
  });

  return routes;
}
