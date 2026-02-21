-- Everflow mock network accounts
CREATE TABLE mock_ef_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT UNIQUE NOT NULL,   -- e.g. "ef_net_001"
  name TEXT NOT NULL,
  network_id TEXT NOT NULL,          -- affiliate network ID
  api_key TEXT NOT NULL DEFAULT 'mock-ef-api-key',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock offers (returned by /v1/networks/offerstable)
CREATE TABLE mock_ef_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES mock_ef_accounts(account_id),
  network_offer_id BIGINT UNIQUE NOT NULL,
  offer_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  tracking_url TEXT NOT NULL,
  preview_url TEXT NOT NULL DEFAULT 'https://example.com/preview',
  payout NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  payout_type TEXT NOT NULL DEFAULT 'CPA',   -- CPA|CPL|CPS|RevShare
  currency_id TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active',     -- active|paused|archived
  description TEXT,
  require_approval BOOLEAN DEFAULT FALSE,
  click_cookie_days INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulated affiliate clicks (transaction_id is the Everflow click ID)
CREATE TABLE mock_ef_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,       -- e.g. "ef_txn_abc123"
  offer_id BIGINT REFERENCES mock_ef_offers(network_offer_id),
  affiliate_id TEXT,
  destination_url TEXT,
  ip_address TEXT DEFAULT '1.2.3.4',
  user_agent TEXT,
  converted BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Postbacks received FROM Propel (conversion notifications)
CREATE TABLE mock_ef_postbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Query params Propel sends:
  nid TEXT,                                  -- network_id
  offer_id TEXT,
  affiliate_id TEXT,
  transaction_id TEXT NOT NULL,              -- matches mock_ef_clicks.transaction_id
  amount NUMERIC(10,2),                      -- payout
  adv1 TEXT,                                 -- Propel internal click_id
  raw_query TEXT,                            -- full query string
  click_matched BOOLEAN DEFAULT FALSE,       -- true if transaction_id matched a known click
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Postback webhook configs
CREATE TABLE mock_ef_postback_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES mock_ef_accounts(account_id),
  name TEXT NOT NULL,
  postback_url TEXT NOT NULL,
  event_name TEXT DEFAULT 'conversion',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
