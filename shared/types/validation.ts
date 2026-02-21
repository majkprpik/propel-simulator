import { z } from 'zod';
import { isValidCurrency } from '../utils/currency';

const currencyField = z.string().refine(
  (val) => isValidCurrency(val),
  { message: 'Currency must be a valid ISO 4217 code (e.g. USD, EUR, GBP)' }
).optional();

// --- Account ---
export const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(255),
  currency: currencyField,
  status: z.enum(['active', 'paused', 'disabled', 'ACTIVE', 'ENABLED', 'PAUSED', 'DISABLED']).optional(),
  account_id: z.string().optional(),
});
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

// --- Campaign ---
export const createCampaignSchema = z.object({
  ad_account_id: z.string().min(1, 'ad_account_id is required'),
  name: z.string().min(1, 'Campaign name is required').max(255),
  objective: z.string().max(100).optional(),
  status: z.string().max(50).optional(),
  daily_budget: z.number().positive('daily_budget must be positive').optional().nullable(),
  campaign_id: z.string().optional(),
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

// --- Ad Group ---
export const createAdGroupSchema = z.object({
  campaign_id: z.string().min(1, 'campaign_id is required'),
  name: z.string().min(1, 'Ad group name is required').max(255),
  status: z.string().max(50).optional(),
  bid_amount: z.number().positive('bid_amount must be positive').optional().nullable(),
  ad_group_id: z.string().optional(),
});
export type CreateAdGroupInput = z.infer<typeof createAdGroupSchema>;

// --- Ad ---
export const createAdSchema = z.object({
  name: z.string().min(1, 'Ad name is required').max(255),
  ad_group_id: z.string().optional().nullable(),
  destination_url: z.string().url('destination_url must be a valid URL').optional().nullable(),
  status: z.string().max(50).optional(),
});
export type CreateAdInput = z.infer<typeof createAdSchema>;

// --- Pixel ---
export const createPixelSchema = z.object({
  ad_account_id: z.string().min(1, 'ad_account_id is required'),
  name: z.string().min(1, 'Pixel name is required').max(255),
  pixel_id: z.string().optional(),
  access_token: z.string().optional(),
  status: z.string().max(50).optional(),
});
export type CreatePixelInput = z.infer<typeof createPixelSchema>;

// --- Click generation ---
export const generateClickSchema = z.object({
  campaign_id: z.string().optional().nullable(),
  ad_group_id: z.string().optional().nullable(),
  ad_id: z.string().optional().nullable(),
  destination_url: z.string().url('destination_url must be a valid URL').optional(),
});
export type GenerateClickInput = z.infer<typeof generateClickSchema>;

// --- Helper to format Zod errors ---
export function formatZodErrors(error: z.ZodError): string[] {
  return error.errors.map((e) => {
    const path = e.path.length > 0 ? `${e.path.join('.')}: ` : '';
    return `${path}${e.message}`;
  });
}
