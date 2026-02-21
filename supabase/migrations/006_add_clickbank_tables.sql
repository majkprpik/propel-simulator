-- ClickBank mock accounts
CREATE TABLE IF NOT EXISTS mock_cb_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT UNIQUE NOT NULL DEFAULT ('cb_' || substr(gen_random_uuid()::TEXT, 1, 8)),
  nickname TEXT NOT NULL,
  api_key TEXT NOT NULL DEFAULT 'mock-cb-api-key',
  dev_key TEXT NOT NULL DEFAULT 'mock-cb-dev-key',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock ClickBank products/offers
CREATE TABLE IF NOT EXISTS mock_cb_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES mock_cb_accounts(account_id),
  site TEXT NOT NULL,
  item TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 37.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT DEFAULT 'HEALTH',
  gravity NUMERIC(8,2) DEFAULT 50.0,
  commission_rate NUMERIC(5,2) DEFAULT 75.0,
  hoplink TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(site, item),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock ClickBank orders (sales)
CREATE TABLE IF NOT EXISTS mock_cb_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES mock_cb_accounts(account_id),
  receipt TEXT UNIQUE NOT NULL,
  cb_order_id TEXT UNIQUE NOT NULL,
  product_site TEXT,
  product_item TEXT,
  affiliate_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  customer_email TEXT,
  status TEXT DEFAULT 'SALE',
  cbpop TEXT,
  postback_received BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Postbacks received FROM Propel
CREATE TABLE IF NOT EXISTS mock_cb_postbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt TEXT,
  cb_order_id TEXT,
  product_site TEXT,
  product_item TEXT,
  affiliate_id TEXT,
  amount NUMERIC(10,2),
  cbpop TEXT,
  raw_query TEXT,
  order_matched BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Postback webhook configs
CREATE TABLE IF NOT EXISTS mock_cb_postback_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES mock_cb_accounts(account_id),
  name TEXT NOT NULL,
  postback_url TEXT NOT NULL,
  event_name TEXT DEFAULT 'sale',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
