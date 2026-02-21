import { Hono } from 'hono';
import { getDb, type AppType } from '../index';

export const conversionRoutes = new Hono<AppType>();

// GET /aff_lsr.php — HasOffers classic postback endpoint
// Query params: transaction_id, offer_id, payout
conversionRoutes.get('/aff_lsr.php', async (c) => {
  const db = getDb(c);

  const transactionId = c.req.query('transaction_id');
  if (!transactionId) {
    return c.text('0', 400);
  }

  const offerId = c.req.query('offer_id') ?? null;
  const payout = c.req.query('payout') ? Number(c.req.query('payout')) : null;

  // Capture full query string
  const rawQuery = c.req.url.split('?')[1] ?? '';

  // Check if transaction_id matches a known click
  const { data: click } = await db
    .from('mock_ho_clicks')
    .select('id')
    .eq('click_id', transactionId)
    .single();

  const clickMatched = !!click;

  // Mark the click as converted if found
  if (clickMatched) {
    await db
      .from('mock_ho_clicks')
      .update({ converted: true })
      .eq('click_id', transactionId);
  }

  // Store the postback
  const { error } = await db.from('mock_ho_postbacks').insert({
    transaction_id: transactionId,
    offer_id: offerId,
    payout,
    raw_query: rawQuery,
    click_matched: clickMatched,
  });

  if (error) return c.text('0', 500);

  return c.text('1');
});
