import { createCrudRoutes } from '../../../../shared/utils/crud-factory';
import { generateGclid } from '../../../../shared/utils/click-id-generator';
import { getDb, testState } from '../index';

// Pixels are called "Conversion Actions" in Google terminology
export const crudRoutes = createCrudRoutes({
  platform: 'google',
  generateClickId: generateGclid,
  getDb,
  isRateLimitEnabled: () => testState.crudRateLimitEnabled,
  defaults: {
    campaignObjective: 'SEARCH',
    campaignStatus: 'ENABLED',
    adGroupStatus: 'ENABLED',
    adStatus: 'ENABLED',
    generateAccountId: () => crypto.randomUUID().replace(/-/g, '').slice(0, 10),
    generateCampaignId: () => crypto.randomUUID().replace(/-/g, '').slice(0, 11),
    generateAdGroupId: () => crypto.randomUUID().replace(/-/g, '').slice(0, 11),
    generateAdId: () => crypto.randomUUID().replace(/-/g, '').slice(0, 11),
    generatePixelId: () => `conversionActions/${crypto.randomUUID().replace(/-/g, '').slice(0, 9)}`,
    generateAccessToken: () => null,
  },
});
