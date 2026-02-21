export type Platform = 'facebook' | 'google' | 'tiktok' | 'newsbreak' | 'snapchat';

export interface MockAdAccount {
  id: string;
  platform: Platform;
  account_id: string;
  name: string;
  currency: string;
  status: string;
  created_at: string;
}

export interface MockPixel {
  id: string;
  platform: Platform;
  ad_account_id: string;
  pixel_id: string;
  name: string;
  access_token: string | null;
  status: string;
  created_at: string;
}

export interface MockCampaign {
  id: string;
  platform: Platform;
  ad_account_id: string;
  campaign_id: string;
  name: string;
  objective: string | null;
  status: string;
  daily_budget: number | null;
  created_at: string;
}

export interface MockAdGroup {
  id: string;
  platform: Platform;
  campaign_id: string;
  ad_group_id: string;
  name: string;
  status: string;
  bid_amount: number | null;
  created_at: string;
}

export interface MockAd {
  id: string;
  platform: Platform;
  ad_group_id: string;
  ad_id: string;
  name: string;
  destination_url: string | null;
  status: string;
  created_at: string;
}

export interface MockEvent {
  id: string;
  platform: Platform;
  pixel_id: string;
  event_name: string;
  event_id: string | null;
  event_time: string;
  click_id: string | null;
  campaign_id: string | null;
  ad_group_id: string | null;
  ad_id: string | null;
  hashed_email: string | null;
  hashed_phone: string | null;
  client_ip: string | null;
  user_agent: string | null;
  value: number | null;
  currency: string | null;
  transaction_id: string | null;
  request_payload: Record<string, unknown> | null;
  received_at: string;
}

export interface MockPostbackConfig {
  id: string;
  platform: Platform;
  ad_account_id: string;
  name: string;
  postback_url: string;
  event_name: string;
  is_active: boolean;
  created_at: string;
}

export interface MockClick {
  id: string;
  platform: Platform;
  click_id: string;
  campaign_id: string | null;
  ad_group_id: string | null;
  ad_id: string | null;
  destination_url: string | null;
  clicked_at: string;
}

// ── Everflow Types ────────────────────────────────────────────────────────

export interface EfAccount {
  id: string;
  account_id: string;
  name: string;
  network_id: string;
  api_key: string;
  status: string;
  created_at: string;
}

export interface EfOffer {
  id: string;
  account_id: string | null;
  network_offer_id: number;
  offer_id: number;
  name: string;
  tracking_url: string;
  preview_url: string;
  payout: number;
  payout_type: string;
  currency_id: string;
  status: string;
  description: string | null;
  require_approval: boolean;
  click_cookie_days: number;
  created_at: string;
}

export interface EfClick {
  id: string;
  transaction_id: string;
  offer_id: number | null;
  affiliate_id: string | null;
  destination_url: string | null;
  ip_address: string;
  user_agent: string | null;
  converted: boolean;
  clicked_at: string;
}

export interface EfPostback {
  id: string;
  nid: string | null;
  offer_id: string | null;
  affiliate_id: string | null;
  transaction_id: string;
  amount: number | null;
  adv1: string | null;
  raw_query: string | null;
  click_matched: boolean;
  received_at: string;
}

export interface EfPostbackConfig {
  id: string;
  account_id: string | null;
  name: string;
  postback_url: string;
  event_name: string;
  is_active: boolean;
  created_at: string;
}
