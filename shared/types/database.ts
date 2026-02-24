export type Platform = 'facebook' | 'google' | 'tiktok' | 'newsbreak' | 'snapchat' | 'everflow' | 'shopify' | 'clickbank' | 'cake' | 'hasoffers';

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

// ── Shopify Types ─────────────────────────────────────────────────────────

export interface ShopifyShop {
  id: string;
  shop_domain: string;
  access_token: string;
  webhook_secret: string;
  status: string;
  created_at: string;
}

export interface ShopifyOrder {
  id: string;
  shop_domain: string | null;
  order_id: number;
  order_number: string;
  email: string | null;
  total_price: number;
  currency: string;
  checkout_token: string | null;
  landing_site: string | null;
  referring_site: string | null;
  source_name: string;
  financial_status: string;
  line_items: Record<string, unknown>[];
  customer: Record<string, unknown>;
  webhook_fired_at: string | null;
  webhook_target_url: string | null;
  created_at: string;
}

export interface ShopifyWebhookLog {
  id: string;
  order_id: number | null;
  shop_domain: string | null;
  target_url: string;
  topic: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  fired_at: string;
}

// ── ClickBank Types ───────────────────────────────────────────────────────

export interface CbAccount {
  id: string;
  account_id: string;
  nickname: string;
  api_key: string;
  dev_key: string;
  status: string;
  created_at: string;
}

export interface CbProduct {
  id: string;
  account_id: string | null;
  site: string;
  item: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  gravity: number;
  commission_rate: number;
  hoplink: string;
  status: string;
  created_at: string;
}

export interface CbOrder {
  id: string;
  account_id: string | null;
  receipt: string;
  cb_order_id: string;
  product_site: string | null;
  product_item: string | null;
  affiliate_id: string | null;
  amount: number;
  currency: string;
  customer_email: string | null;
  status: string;
  cbpop: string | null;
  postback_received: boolean;
  created_at: string;
}

export interface CbPostback {
  id: string;
  receipt: string | null;
  cb_order_id: string | null;
  product_site: string | null;
  product_item: string | null;
  affiliate_id: string | null;
  amount: number | null;
  cbpop: string | null;
  raw_query: string | null;
  order_matched: boolean;
  received_at: string;
}

export interface CbPostbackConfig {
  id: string;
  account_id: string | null;
  name: string;
  postback_url: string;
  event_name: string;
  is_active: boolean;
  created_at: string;
}

// ── Cake Types ────────────────────────────────────────────────────────────

export interface CakeAccount {
  id: string;
  account_id: string;
  name: string;
  api_key: string;
  domain: string;
  status: string;
  created_at: string;
}

export interface CakeOffer {
  id: string;
  account_id: string | null;
  offer_id: number;
  offer_name: string;
  offer_status_id: number;
  price_format_id: number;
  price: number;
  offer_link: string;
  preview_link: string;
  thankyou_link: string;
  status: string;
  created_at: string;
}

export interface CakeClick {
  id: string;
  click_id: string;
  offer_id: number | null;
  sub_id: string | null;
  destination_url: string | null;
  ip_address: string;
  user_agent: string | null;
  converted: boolean;
  clicked_at: string;
}

export interface CakePostback {
  id: string;
  s1: string | null;
  offer_id: string | null;
  amount: number | null;
  raw_query: string | null;
  click_matched: boolean;
  received_at: string;
}

// ── HasOffers Types ───────────────────────────────────────────────────────

export interface HoAccount {
  id: string;
  account_id: string;
  name: string;
  network_id: string;
  api_key: string;
  status: string;
  created_at: string;
}

export interface HoOffer {
  id: string;
  account_id: string | null;
  offer_id: number;
  name: string;
  status: string;
  preview_url: string;
  offer_url: string;
  default_payout: number;
  default_payout_type: string;
  currency: string;
  description: string | null;
  created_at: string;
}

export interface HoClick {
  id: string;
  click_id: string;
  offer_id: number | null;
  affiliate_id: string | null;
  destination_url: string | null;
  ip_address: string;
  user_agent: string | null;
  converted: boolean;
  clicked_at: string;
}

export interface HoPostback {
  id: string;
  transaction_id: string | null;
  offer_id: string | null;
  payout: number | null;
  raw_query: string | null;
  click_matched: boolean;
  received_at: string;
}
