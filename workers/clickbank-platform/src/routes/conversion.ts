import { Hono } from 'hono';
import { getDb, type AppType } from '../index';

export const conversionRoutes = new Hono<AppType>();

// GET /conversions — Receives postbacks FROM Propel when a conversion is logged
conversionRoutes.get('/conversions', async (c) => {
  const db = getDb(c);

  const receipt = c.req.query('receipt') ?? null;
  const cbOrderId = c.req.query('cbOrderId') ?? null;
  const cbpop = c.req.query('cbpop') ?? null;
  const amount = c.req.query('amount') ? Number(c.req.query('amount')) : null;
  const siteName = c.req.query('siteName') ?? null;
  const item = c.req.query('item') ?? null;
  const affiliate = c.req.query('affiliate') ?? null;

  // Capture full query string
  const rawQuery = c.req.url.split('?')[1] ?? '';

  // Check if receipt matches a known order
  let orderMatched = false;
  if (receipt) {
    const { data: order } = await db
      .from('mock_cb_orders')
      .select('id')
      .eq('receipt', receipt)
      .single();

    orderMatched = !!order;

    // Mark the order as having received a postback
    if (orderMatched) {
      await db
        .from('mock_cb_orders')
        .update({ postback_received: true })
        .eq('receipt', receipt);
    }
  }

  // Store the postback
  const { error } = await db.from('mock_cb_postbacks').insert({
    receipt,
    cb_order_id: cbOrderId,
    product_site: siteName,
    product_item: item,
    affiliate_id: affiliate,
    amount,
    cbpop,
    raw_query: rawQuery,
    order_matched: orderMatched,
  });

  if (error) return c.json({ error: error.message }, 500);

  return c.json({ status: 'ok', message: 'Postback recorded', order_matched: orderMatched });
});

// GET /1/orders/:receipt — Order lookup (verification endpoint)
conversionRoutes.get('/1/orders/:receipt', async (c) => {
  const db = getDb(c);
  const receipt = c.req.param('receipt');

  const { data: order, error } = await db
    .from('mock_cb_orders')
    .select('*')
    .eq('receipt', receipt)
    .single();

  if (error || !order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json({
    receiptData: {
      receipt: order.receipt,
      cbOrderId: order.cb_order_id,
      siteName: order.product_site,
      item: order.product_item,
      affiliate: order.affiliate_id,
      amount: { currency: order.currency || 'USD', total: Number(order.amount).toFixed(2) },
      status: order.status || 'SALE',
      date: order.created_at,
    },
  });
});
