import { Hono } from 'hono';
import { testState, type AppType } from '../index';

export const testRoutes = new Hono<AppType>();

testRoutes.post('/api/test/rate-limit', async (c) => {
  const body = await c.req.json();
  testState.rateLimitEnabled = body.enabled ?? !testState.rateLimitEnabled;
  return c.json({ rateLimitEnabled: testState.rateLimitEnabled });
});

testRoutes.post('/api/test/crud-rate-limit', async (c) => {
  const body = await c.req.json();
  testState.crudRateLimitEnabled = body.enabled ?? !testState.crudRateLimitEnabled;
  return c.json({ crudRateLimitEnabled: testState.crudRateLimitEnabled });
});

testRoutes.post('/api/test/reset', async (c) => {
  testState.rateLimitEnabled = false;
  testState.crudRateLimitEnabled = false;
  return c.json({ status: 'reset', rateLimitEnabled: false, crudRateLimitEnabled: false });
});
