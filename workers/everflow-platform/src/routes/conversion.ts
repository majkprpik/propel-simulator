import { Hono } from 'hono';
import { getDb, type AppType } from '../index';

export const conversionRoutes = new Hono<AppType>();

// GET /conversions — What Propel sends after a conversion
// Query params: nid, offer_id, affiliate_id, transaction_id, amount, adv1
conversionRoutes.get('/conversions', async (c) => {
  const db = getDb(c);

  const transactionId = c.req.query('transaction_id');
  if (!transactionId) {
    return c.json({ error: 'transaction_id is required' }, 400);
  }

  const nid = c.req.query('nid') ?? null;
  const offerId = c.req.query('offer_id') ?? null;
  const affiliateId = c.req.query('affiliate_id') ?? null;
  const amount = c.req.query('amount') ? Number(c.req.query('amount')) : null;
  const adv1 = c.req.query('adv1') ?? null;

  // Capture full query string
  const rawQuery = c.req.url.split('?')[1] ?? '';

  // Check if transaction_id matches a known click
  const { data: click } = await db
    .from('mock_ef_clicks')
    .select('id')
    .eq('transaction_id', transactionId)
    .single();

  const clickMatched = !!click;

  // Mark the click as converted if found
  if (clickMatched) {
    await db
      .from('mock_ef_clicks')
      .update({ converted: true })
      .eq('transaction_id', transactionId);
  }

  // Store the postback
  const { error } = await db.from('mock_ef_postbacks').insert({
    nid,
    offer_id: offerId,
    affiliate_id: affiliateId,
    transaction_id: transactionId,
    amount,
    adv1,
    raw_query: rawQuery,
    click_matched: clickMatched,
  });

  if (error) return c.json({ error: error.message }, 500);

  return c.json({ status: 'ok', message: 'Conversion recorded', click_matched: clickMatched });
});
