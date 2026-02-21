import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { crudRoutes } from './routes/crud';
import { postbackConfigRoutes } from './routes/postback-configs';
import { eventRoutes } from './routes/events';
import { reportsRoutes } from './routes/reports';
import { testRoutes } from './routes/test';

type Bindings = { SUPABASE_URL: string; SUPABASE_SERVICE_KEY: string };

export type AppType = { Bindings: Bindings };

const app = new Hono<AppType>();

app.use('*', cors());

export const testState = {
  rateLimitEnabled: false,
  crudRateLimitEnabled: false,
};

export function getDb(c: { env: Bindings }): SupabaseClient {
  return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY);
}

app.get('/health', (c) => c.json({ status: 'ok', platform: 'newsbreak' }));

app.route('/', crudRoutes);
app.route('/', postbackConfigRoutes);
app.route('/', eventRoutes);
app.route('/', reportsRoutes);
app.route('/', testRoutes);

export default app;
