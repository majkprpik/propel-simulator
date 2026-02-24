import { Hono } from 'hono';
import { testState } from '../state';
import type { AppType } from '../index';

export const testRoutes = new Hono<AppType>();

testRoutes.post('/api/test/rate-limit', async (c) => {
  const body = await c.req.json();
  testState.rateLimitEnabled = body.enabled ?? !testState.rateLimitEnabled;
  return c.json({ rateLimitEnabled: testState.rateLimitEnabled });
});

testRoutes.post('/api/test/error-mode', async (c) => {
  const body = await c.req.json();
  testState.errorModeEnabled = body.enabled ?? !testState.errorModeEnabled;
  return c.json({ errorModeEnabled: testState.errorModeEnabled });
});

testRoutes.post('/api/test/reset', async (c) => {
  testState.rateLimitEnabled = false;
  testState.errorModeEnabled = false;
  return c.json({ status: 'reset', rateLimitEnabled: false, errorModeEnabled: false });
});
