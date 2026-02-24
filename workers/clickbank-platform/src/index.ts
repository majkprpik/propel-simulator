import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createGetDb } from '../../../shared/utils/worker-db';
import type { WorkerAppType } from '../../../shared/types/worker';
import { crudRoutes } from './routes/crud';
import { productApiRoutes } from './routes/product-api';
import { conversionRoutes } from './routes/conversion';
import { testRoutes } from './routes/test';

export type AppType = WorkerAppType;

const app = new Hono<AppType>();

app.use('*', cors());

export { testState } from './state';

const _getDb = createGetDb();
export function getDb(c: Parameters<typeof _getDb>[0]) { return _getDb(c); }

app.get('/health', (c) => c.json({ status: 'ok', platform: 'clickbank' }));

app.route('/', crudRoutes);
app.route('/', productApiRoutes);
app.route('/', conversionRoutes);
app.route('/', testRoutes);

export default app;
