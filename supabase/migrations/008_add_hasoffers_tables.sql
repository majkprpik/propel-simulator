CREATE TABLE IF NOT EXISTS mock_ho_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT UNIQUE NOT NULL DEFAULT ('ho_' || substr(gen_random_uuid()::TEXT, 1, 8)),
  name TEXT NOT NULL,
  network_id TEXT NOT NULL DEFAULT 'simulator',
  api_key TEXT NOT NULL DEFAULT 'mock-ho-network-token',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_ho_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES mock_ho_accounts(account_id),
  offer_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  preview_url TEXT NOT NULL DEFAULT 'https://example.com/preview',
  offer_url TEXT NOT NULL,
  default_payout NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  default_payout_type TEXT NOT NULL DEFAULT 'cpa_flat',
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_ho_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id TEXT UNIQUE NOT NULL,
  offer_id BIGINT REFERENCES mock_ho_offers(offer_id),
  affiliate_id TEXT,
  destination_url TEXT,
  ip_address TEXT DEFAULT '1.2.3.4',
  user_agent TEXT,
  converted BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_ho_postbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT,
  offer_id TEXT,
  payout NUMERIC(10,2),
  raw_query TEXT,
  click_matched BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT NOW()
);
