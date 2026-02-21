CREATE TABLE IF NOT EXISTS mock_cake_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT UNIQUE NOT NULL DEFAULT ('cake_' || substr(gen_random_uuid()::TEXT, 1, 8)),
  name TEXT NOT NULL,
  api_key TEXT NOT NULL DEFAULT 'mock-cake-api-key',
  domain TEXT NOT NULL DEFAULT 'simulator.cakemarketing.com',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_cake_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES mock_cake_accounts(account_id),
  offer_id BIGINT UNIQUE NOT NULL,
  offer_name TEXT NOT NULL,
  offer_status_id INT NOT NULL DEFAULT 1,
  price_format_id INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  offer_link TEXT NOT NULL,
  preview_link TEXT NOT NULL DEFAULT 'https://example.com/preview',
  thankyou_link TEXT NOT NULL DEFAULT 'https://example.com/thankyou',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_cake_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id TEXT UNIQUE NOT NULL,
  offer_id BIGINT REFERENCES mock_cake_offers(offer_id),
  sub_id TEXT,
  destination_url TEXT,
  ip_address TEXT DEFAULT '1.2.3.4',
  user_agent TEXT,
  converted BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_cake_postbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  s1 TEXT,
  offer_id TEXT,
  amount NUMERIC(10,2),
  raw_query TEXT,
  click_matched BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT NOW()
);
