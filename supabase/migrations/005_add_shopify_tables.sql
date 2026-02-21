-- Shopify mock shops
CREATE TABLE IF NOT EXISTS mock_shopify_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL DEFAULT 'mock-shopify-token',
  webhook_secret TEXT NOT NULL DEFAULT 'mock-webhook-secret',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock Shopify orders
CREATE TABLE IF NOT EXISTS mock_shopify_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT REFERENCES mock_shopify_shops(shop_domain),
  order_id BIGINT UNIQUE NOT NULL,
  order_number TEXT NOT NULL,
  email TEXT,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  checkout_token TEXT,
  landing_site TEXT,
  referring_site TEXT,
  source_name TEXT DEFAULT 'web',
  financial_status TEXT NOT NULL DEFAULT 'paid',
  line_items JSONB DEFAULT '[]',
  customer JSONB DEFAULT '{}',
  webhook_fired_at TIMESTAMPTZ,
  webhook_target_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook fire log
CREATE TABLE IF NOT EXISTS mock_shopify_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id BIGINT,
  shop_domain TEXT,
  target_url TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'orders/paid',
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  fired_at TIMESTAMPTZ DEFAULT NOW()
);
