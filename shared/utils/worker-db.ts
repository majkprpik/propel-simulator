import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Context } from 'hono';
import type { WorkerAppType } from '../types/worker';

/**
 * Creates a cached Supabase client getter for a Cloudflare Worker.
 * Each call to createGetDb() returns its own getDb function with isolated state,
 * so each worker module gets independent caching.
 */
export function createGetDb() {
  let _db: SupabaseClient | null = null;
  let _dbKey: string | null = null;
  return function getDb(c: Context<WorkerAppType>): SupabaseClient {
    const key = `${c.env.SUPABASE_URL}:${c.env.SUPABASE_SERVICE_KEY}`;
    if (_db && _dbKey === key) return _db;
    _db = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY);
    _dbKey = key;
    return _db;
  };
}
