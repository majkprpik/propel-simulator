import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createGetDb } from '../../../shared/utils/worker-db';
import type { WorkerAppType } from '../../../shared/types/worker';
import { crudRoutes } from './routes/crud';
import { postbackConfigRoutes } from './routes/postback-configs';
import { capiRoutes } from './routes/capi';
import { testRoutes } from './routes/test';

export type AppType = WorkerAppType;

const app = new Hono<AppType>();

app.use('*', cors());

export { testState } from './state';

const _getDb = createGetDb();
export function getDb(c: Parameters<typeof _getDb>[0]) { return _getDb(c); }

app.get('/health', (c) => c.json({ status: 'ok', platform: 'facebook' }));

app.route('/', crudRoutes);
app.route('/', postbackConfigRoutes);
app.route('/', capiRoutes);
app.route('/', testRoutes);

export default app;
