-- Mock Ad Platform Simulator Schema

-- Ad accounts (all platforms)
CREATE TABLE mock_ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook','google','tiktok','newsbreak','snapchat')),
  account_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, account_id)
);

-- Tracking pixels / conversion actions
CREATE TABLE mock_pixels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook','google','tiktok','newsbreak','snapchat')),
  ad_account_id UUID REFERENCES mock_ad_accounts(id) ON DELETE CASCADE,
  pixel_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  access_token VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, pixel_id)
);

-- Campaigns
CREATE TABLE mock_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook','google','tiktok','newsbreak','snapchat')),
  ad_account_id UUID REFERENCES mock_ad_accounts(id) ON DELETE CASCADE,
  campaign_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  objective VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  daily_budget DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, campaign_id)
);

-- Ad groups / ad sets / ad squads
CREATE TABLE mock_ad_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook','google','tiktok','newsbreak','snapchat')),
  campaign_id UUID REFERENCES mock_campaigns(id) ON DELETE CASCADE,
  ad_group_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  bid_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, ad_group_id)
);

-- Ads
CREATE TABLE mock_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook','google','tiktok','newsbreak','snapchat')),
  ad_group_id UUID REFERENCES mock_ad_groups(id) ON DELETE CASCADE,
  ad_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  destination_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, ad_id)
);

-- Received CAPI/conversion events
CREATE TABLE mock_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook','google','tiktok','newsbreak','snapchat')),
  pixel_id VARCHAR(100) NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  event_id VARCHAR(255),
  event_time TIMESTAMPTZ NOT NULL,
  click_id VARCHAR(255),
  campaign_id VARCHAR(100),
  ad_group_id VARCHAR(100),
  ad_id VARCHAR(100),
  hashed_email VARCHAR(64),
  hashed_phone VARCHAR(64),
  client_ip VARCHAR(45),
  user_agent TEXT,
  value DECIMAL(10,2),
  currency VARCHAR(3),
  transaction_id VARCHAR(255),
  request_payload JSONB,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, event_id)
);

-- Postback configuration
CREATE TABLE mock_postback_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook','google','tiktok','newsbreak','snapchat')),
  ad_account_id UUID REFERENCES mock_ad_accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  postback_url TEXT NOT NULL,
  event_name VARCHAR(100) DEFAULT 'sale',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated clicks
CREATE TABLE mock_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook','google','tiktok','newsbreak','snapchat')),
  click_id VARCHAR(255) NOT NULL,
  campaign_id VARCHAR(100),
  ad_group_id VARCHAR(100),
  ad_id VARCHAR(100),
  destination_url TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, click_id)
);

-- Indexes for common queries
CREATE INDEX idx_events_platform ON mock_events(platform);
CREATE INDEX idx_events_pixel_id ON mock_events(pixel_id);
CREATE INDEX idx_events_received_at ON mock_events(received_at DESC);
CREATE INDEX idx_events_platform_pixel ON mock_events(platform, pixel_id);
CREATE INDEX idx_campaigns_platform ON mock_campaigns(platform);
CREATE INDEX idx_clicks_platform ON mock_clicks(platform);
CREATE INDEX idx_clicks_click_id ON mock_clicks(click_id);
