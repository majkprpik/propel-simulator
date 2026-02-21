import { Hono } from 'hono';
import { getDb, type AppType } from '../index';

export const conversionRoutes = new Hono<AppType>();

// GET /pixel.track?s1={click_id}&offer_id={offer_id}&amount={amount}
// s1 is Cake's sub-ID param (maps to click_id / Propel click ID)
conversionRoutes.get('/pixel.track', async (c) => {
  const db = getDb(c);

  const s1 = c.req.query('s1') ?? null;
  const offerId = c.req.query('offer_id') ?? null;
  const amount = c.req.query('amount') ? Number(c.req.query('amount')) : null;

  // Capture full query string
  const rawQuery = c.req.url.split('?')[1] ?? '';

  // Check if s1 matches a known click
  let clickMatched = false;
  if (s1) {
    const { data: click } = await db
      .from('mock_cake_clicks')
      .select('id')
      .eq('click_id', s1)
      .single();

    clickMatched = !!click;

    // Mark the click as converted if found
    if (clickMatched) {
      await db
        .from('mock_cake_clicks')
        .update({ converted: true })
        .eq('click_id', s1);
    }
  }

  // Store the postback
  const { error } = await db.from('mock_cake_postbacks').insert({
    s1,
    offer_id: offerId,
    amount,
    raw_query: rawQuery,
    click_matched: clickMatched,
  });

  if (error) return c.text('0', 500);

  // Real Cake returns plain text "1" on success
  return c.text('1');
});
