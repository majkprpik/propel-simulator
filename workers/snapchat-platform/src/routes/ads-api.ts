import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';

export const adsApiRoutes = new Hono<AppType>();

function validateAuth(c: any): boolean {
  const auth = c.req.header('Authorization');
  return !!auth && auth.startsWith('Bearer ');
}

// GET /v1/me/organizations/:org_id/adaccounts
adsApiRoutes.get('/v1/me/organizations/:org_id/adaccounts', async (c) => {
  if (!validateAuth(c)) {
    return c.json({ request_status: 'ERROR', request_id: 'mock', msg: 'Unauthorized' }, 401);
  }
  if (testState.rateLimitEnabled) {
    return c.json({ request_status: 'ERROR', msg: 'Rate limit exceeded' }, 429);
  }

  const db = getDb(c);
  const { data } = await db
    .from('mock_ad_accounts')
    .select('*')
    .eq('platform', 'snapchat')
    .order('created_at', { ascending: false });

  return c.json({
    request_status: 'SUCCESS',
    request_id: 'mock',
    adaccounts: (data || []).map((a: any) => ({
      sub_request_status: 'SUCCESS',
      adaccount: {
        id: a.account_id,
        name: a.name,
        currency: a.currency,
        status: a.status,
        created_at: a.created_at,
      },
    })),
  });
});

// GET /v1/adaccounts/:id/campaigns
adsApiRoutes.get('/v1/adaccounts/:id/campaigns', async (c) => {
  if (!validateAuth(c)) {
    return c.json({ request_status: 'ERROR', msg: 'Unauthorized' }, 401);
  }
  if (testState.rateLimitEnabled) {
    return c.json({ request_status: 'ERROR', msg: 'Rate limit exceeded' }, 429);
  }

  const accountId = c.req.param('id');
  const db = getDb(c);
  const { data } = await db
    .from('mock_campaigns')
    .select('*')
    .eq('platform', 'snapchat')
    .eq('ad_account_id', accountId)
    .order('created_at', { ascending: false });

  return c.json({
    request_status: 'SUCCESS',
    request_id: 'mock',
    campaigns: (data || []).map((camp: any) => ({
      sub_request_status: 'SUCCESS',
      campaign: {
        id: camp.campaign_id,
        name: camp.name,
        ad_account_id: camp.ad_account_id,
        status: camp.status,
        objective: camp.objective,
        daily_budget_micro: camp.daily_budget ? camp.daily_budget * 1000000 : null,
        created_at: camp.created_at,
      },
    })),
  });
});

// GET /v1/campaigns/:id/adsquads
adsApiRoutes.get('/v1/campaigns/:id/adsquads', async (c) => {
  if (!validateAuth(c)) {
    return c.json({ request_status: 'ERROR', msg: 'Unauthorized' }, 401);
  }

  const campaignId = c.req.param('id');
  const db = getDb(c);
  const { data } = await db
    .from('mock_ad_groups')
    .select('*')
    .eq('platform', 'snapchat')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  return c.json({
    request_status: 'SUCCESS',
    request_id: 'mock',
    adsquads: (data || []).map((sq: any) => ({
      sub_request_status: 'SUCCESS',
      adsquad: {
        id: sq.ad_group_id,
        name: sq.name,
        campaign_id: sq.campaign_id,
        status: sq.status,
        bid_micro: sq.bid_amount ? sq.bid_amount * 1000000 : null,
        created_at: sq.created_at,
      },
    })),
  });
});
