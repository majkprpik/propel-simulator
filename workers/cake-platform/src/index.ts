import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { crudRoutes } from './routes/crud';
import { offerApiRoutes } from './routes/offer-api';
import { conversionRoutes } from './routes/conversion';
import { testRoutes } from './routes/test';

type Bindings = { SUPABASE_URL: string; SUPABASE_SERVICE_KEY: string };

export type AppType = { Bindings: Bindings };

const app = new Hono<AppType>();

app.use('*', cors());

// In-memory test controls
export const testState = {
  rateLimitEnabled: false,
  errorModeEnabled: false,
};

export function getDb(c: { env: Bindings }): SupabaseClient {
  return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY);
}

app.get('/health', (c) => c.json({ status: 'ok', platform: 'cake' }));

app.route('/', crudRoutes);
app.route('/', offerApiRoutes);
app.route('/', conversionRoutes);
app.route('/', testRoutes);

export default app;
