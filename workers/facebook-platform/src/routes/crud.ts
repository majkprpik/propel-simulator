import { createCrudRoutes } from '../../../../shared/utils/crud-factory';
import { generateFbclid } from '../../../../shared/utils/click-id-generator';
import { getDb, testState } from '../index';

// Ad Groups are called "Ad Sets" in Facebook terminology
export const crudRoutes = createCrudRoutes({
  platform: 'facebook',
  generateClickId: generateFbclid,
  getDb,
  isRateLimitEnabled: () => testState.crudRateLimitEnabled,
  defaults: {
    campaignObjective: 'CONVERSIONS',
    campaignStatus: 'ACTIVE',
    adGroupStatus: 'ACTIVE',
    adStatus: 'active',
    generateAccountId: () => `act_${crypto.randomUUID().slice(0, 12)}`,
    generateCampaignId: () => `camp_${crypto.randomUUID().slice(0, 12)}`,
    generateAdGroupId: () => `adset_${crypto.randomUUID().slice(0, 12)}`,
    generateAdId: () => `fb_ad_${crypto.randomUUID().slice(0, 12)}`,
    generatePixelId: () => `px_${crypto.randomUUID().slice(0, 12)}`,
    generateAccessToken: () => `EAAMock${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
  },
});
