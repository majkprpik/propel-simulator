import { Hono } from 'hono';
import { getDb, testState, type AppType } from '../index';

export const offerApiRoutes = new Hono<AppType>();

// GET /Apiv3/json — Unified HasOffers API dispatcher
// Handles Service=Offer&Method=findAll and Service=Goal&Method=track
offerApiRoutes.get('/Apiv3/json', async (c) => {
  const service = c.req.query('Service');
  const method = c.req.query('Method');
  const db = getDb(c);

  // ── Goal.track ──────────────────────────────────────────────────────
  if (service === 'Goal' && method === 'track') {
    const transactionId = c.req.query('transaction_id');
    if (!transactionId) {
      return c.json({
        request: { Target: 'Goal', Method: 'track' },
        response: { status: 0, httpStatus: 400, data: { status: 'error', message: 'transaction_id is required' } },
      }, 400);
    }

    const offerId = c.req.query('offer_id') ?? null;
    const payout = c.req.query('payout') ? Number(c.req.query('payout')) : null;
    const rawQuery = c.req.url.split('?')[1] ?? '';

    const { data: click } = await db
      .from('mock_ho_clicks')
      .select('id')
      .eq('click_id', transactionId)
      .single();

    const clickMatched = !!click;

    if (clickMatched) {
      await db.from('mock_ho_clicks').update({ converted: true }).eq('click_id', transactionId);
    }

    const { error } = await db.from('mock_ho_postbacks').insert({
      transaction_id: transactionId,
      offer_id: offerId,
      payout,
      raw_query: rawQuery,
      click_matched: clickMatched,
    });

    if (error) {
      return c.json({
        request: { Target: 'Goal', Method: 'track' },
        response: { status: 0, httpStatus: 500, data: { status: 'error', message: error.message } },
      }, 500);
    }

    return c.json({
      request: { Target: 'Goal', Method: 'track' },
      response: { status: 1, httpStatus: 200, data: { status: 'success' } },
    });
  }

  // ── Offer.findAll ───────────────────────────────────────────────────
  if (service === 'Offer' && method === 'findAll') {
    if (testState.errorModeEnabled) {
      return c.json({ error: 'Internal Server Error' }, 500);
    }

    const networkToken = c.req.query('network_token');
    if (!networkToken) {
      return c.json({
        request: { Target: 'Offer', Method: 'findAll' },
        response: { status: 0, httpStatus: 401, data: null, errors: ['Missing network_token'] },
      }, 401);
    }

    const { data: account, error: accountError } = await db
      .from('mock_ho_accounts')
      .select('*')
      .eq('api_key', networkToken)
      .eq('status', 'active')
      .single();

    if (accountError || !account) {
      return c.json({
        request: { Target: 'Offer', Method: 'findAll' },
        response: { status: 0, httpStatus: 401, data: null, errors: ['Invalid network_token'] },
      }, 401);
    }

    const page = Math.max(1, Number(c.req.query('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 100)));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const statusFilter = c.req.query('filters[status]') ?? 'active';

    let query = db
      .from('mock_ho_offers')
      .select('*', { count: 'exact' })
      .eq('account_id', account.account_id)
      .order('offer_id', { ascending: true })
      .range(from, to);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: offers, count, error } = await query;
    if (error) return c.json({ error: error.message }, 500);

    const totalCount = count ?? 0;
    const pageCount = Math.max(1, Math.ceil(totalCount / limit));

    const dataObj: Record<string, { Offer: Record<string, unknown> }> = {};
    (offers ?? []).forEach((o, index) => {
      const key = String(index + 1);
      dataObj[key] = {
        Offer: {
          id: String(o.offer_id),
          name: o.name,
          status: o.status,
          preview_url: o.preview_url,
          offer_url: o.offer_url,
          default_payout: String(Number(o.default_payout).toFixed(2)),
          default_payout_type: o.default_payout_type,
          currency: o.currency,
          description: o.description || '',
        },
      };
    });

    return c.json({
      request: { Target: 'Offer', Method: 'findAll' },
      response: {
        status: 1,
        httpStatus: 200,
        data: {
          pageCount,
          current: page,
          count: String(totalCount),
          data: dataObj,
          errors: [],
          status: 1,
        },
      },
    });
  }

  // ── Unknown Service/Method ──────────────────────────────────────────
  return c.json({
    request: { Target: service, Method: method },
    response: {
      status: 0,
      httpStatus: 400,
      data: null,
      errors: [`Unknown Service/Method: ${service}/${method}`],
    },
  }, 400);
});
