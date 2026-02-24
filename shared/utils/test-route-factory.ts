import { Hono } from 'hono';
import type { WorkerAppType } from '../types/worker';

interface TestState {
  rateLimitEnabled: boolean;
  crudRateLimitEnabled?: boolean;
  errorModeEnabled?: boolean;
}

export function createTestRoutes(testState: TestState): Hono<WorkerAppType> {
  const app = new Hono<WorkerAppType>();

  app.post('/api/test/rate-limit', async (c) => {
    const body = await c.req.json();
    testState.rateLimitEnabled = body.enabled ?? !testState.rateLimitEnabled;
    return c.json({ rateLimitEnabled: testState.rateLimitEnabled });
  });

  if ('crudRateLimitEnabled' in testState) {
    app.post('/api/test/crud-rate-limit', async (c) => {
      const body = await c.req.json();
      testState.crudRateLimitEnabled = body.enabled ?? !testState.crudRateLimitEnabled;
      return c.json({ crudRateLimitEnabled: testState.crudRateLimitEnabled });
    });
  }

  if ('errorModeEnabled' in testState) {
    app.post('/api/test/error-mode', async (c) => {
      const body = await c.req.json();
      testState.errorModeEnabled = body.enabled ?? !testState.errorModeEnabled;
      return c.json({ errorModeEnabled: testState.errorModeEnabled });
    });
  }

  app.post('/api/test/reset', async (c) => {
    // Reset all boolean fields to false and return current state
    const result: Record<string, unknown> = { status: 'reset' };
    for (const key of Object.keys(testState) as Array<keyof TestState>) {
      testState[key] = false;
      result[key] = false;
    }
    return c.json(result);
  });

  return app;
}
