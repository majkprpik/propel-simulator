-- Add missing postback config tables for Cake and HasOffers (matching Everflow/ClickBank pattern)

CREATE TABLE IF NOT EXISTS mock_cake_postback_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES mock_cake_accounts(account_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  postback_url TEXT NOT NULL,
  event_name TEXT NOT NULL DEFAULT 'conversion',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_ho_postback_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT REFERENCES mock_ho_accounts(account_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  postback_url TEXT NOT NULL,
  event_name TEXT NOT NULL DEFAULT 'conversion',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON mock_cake_postback_configs TO service_role, authenticated, anon;
GRANT ALL ON mock_ho_postback_configs TO service_role, authenticated, anon;
