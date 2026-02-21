// Facebook CAPI request/response
export interface FacebookCAPIRequest {
  data: Array<{
    event_name: string;
    event_time: number;
    event_id?: string;
    action_source?: string;
    user_data?: {
      fbc?: string;
      fbp?: string;
      em?: string[];
      ph?: string[];
      client_ip_address?: string;
      client_user_agent?: string;
    };
    custom_data?: {
      value?: number;
      currency?: string;
      order_id?: string;
    };
  }>;
  access_token?: string;
}

export interface FacebookCAPIResponse {
  events_received: number;
  fbtrace_id: string;
  messages: string[];
}

// Google Ads conversion request/response
export interface GoogleConversionRequest {
  conversions: Array<{
    conversionAction: string;
    gclid?: string;
    conversionValue?: number;
    conversionDateTime: string;
    currencyCode?: string;
    orderId?: string;
  }>;
  partialFailure?: boolean;
}

export interface GoogleConversionResponse {
  results: Array<{
    conversionDateTime: string;
  }>;
  partialFailureError: null | {
    code: number;
    message: string;
  };
}

// TikTok Events API request/response
export interface TikTokEventRequest {
  pixel_id: string;
  data: Array<{
    event_name: string;
    event_id?: string;
    timestamp: number;
    user_data?: {
      ttclid?: string;
      email?: string;
      phone?: string;
      ip?: string;
      user_agent?: string;
    };
    properties?: {
      value?: number;
      currency?: string;
      order_id?: string;
    };
  }>;
}

export interface TikTokEventResponse {
  code: number;
  message: string;
  data?: {
    event_ids: string[];
  };
}

// Snapchat CAPI request/response
export interface SnapchatCAPIRequest {
  pixel_id: string;
  event: string;
  timestamp: number;
  hashed_email?: string;
  hashed_phone?: string;
  click_id?: string;
  price?: string;
  currency?: string;
  transaction_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface SnapchatCAPIResponse {
  status: string;
  request_id: string;
}

// NewsBreak report response
export interface NewsBreakReportItem {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  spend: string;
  conversions: number;
}

export interface NewsBreakReportResponse {
  code: number;
  data: NewsBreakReportItem[];
}

// Generic CRUD response
export interface CRUDResponse<T> {
  data: T;
  error?: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}
