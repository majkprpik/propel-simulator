import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';

export const reportsRoutes = new Hono<AppType>();

// Validate X-Api-Key for all NewsBreak API routes
function validateApiKey(c: any): boolean {
  const apiKey = c.req.header('X-Api-Key');
  return !!apiKey;
}

// GET /reports/getIntegratedReport - returns campaign stats
reportsRoutes.get('/reports/getIntegratedReport', async (c) => {
  if (testState.rateLimitEnabled) {
    return c.json({ code: 429, message: 'Rate limit exceeded' }, 429);
  }

  if (!validateApiKey(c)) {
    return c.json({ code: 401, message: 'Invalid or missing API key' }, 401);
  }

  const db = getDb(c);

  // Fetch campaigns for this platform
  const { data: campaigns } = await db
    .from('mock_campaigns')
    .select('campaign_id, name')
    .eq('platform', 'newsbreak');

  // Generate mock stats for each campaign
  const reportData = (campaigns || []).map((camp) => ({
    campaign_id: camp.campaign_id,
    campaign_name: camp.name,
    impressions: Math.floor(Math.random() * 100000),
    clicks: Math.floor(Math.random() * 5000),
    spend: (Math.random() * 1000).toFixed(2),
    conversions: Math.floor(Math.random() * 100),
  }));

  return c.json({
    code: 0,
    data: reportData,
  });
});

// GET /campaign/getList - returns campaigns
reportsRoutes.get('/campaign/getList', async (c) => {
  if (testState.rateLimitEnabled) {
    return c.json({ code: 429, message: 'Rate limit exceeded' }, 429);
  }

  if (!validateApiKey(c)) {
    return c.json({ code: 401, message: 'Invalid or missing API key' }, 401);
  }

  const db = getDb(c);
  const { data, error } = await db
    .from('mock_campaigns')
    .select('*')
    .eq('platform', 'newsbreak')
    .order('created_at', { ascending: false });

  if (error) return c.json({ code: 500, message: error.message }, 500);

  return c.json({
    code: 0,
    data: data || [],
  });
});

// GET /ad/getList - returns ads (ad groups)
reportsRoutes.get('/ad/getList', async (c) => {
  if (testState.rateLimitEnabled) {
    return c.json({ code: 429, message: 'Rate limit exceeded' }, 429);
  }

  if (!validateApiKey(c)) {
    return c.json({ code: 401, message: 'Invalid or missing API key' }, 401);
  }

  const db = getDb(c);
  const campaignId = c.req.query('campaign_id');
  let query = db
    .from('mock_ad_groups')
    .select('*')
    .eq('platform', 'newsbreak')
    .order('created_at', { ascending: false });

  if (campaignId) query = query.eq('campaign_id', campaignId);

  const { data, error } = await query;

  if (error) return c.json({ code: 500, message: error.message }, 500);

  return c.json({
    code: 0,
    data: data || [],
  });
});
