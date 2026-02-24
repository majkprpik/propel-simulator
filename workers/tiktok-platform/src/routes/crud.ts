import { createCrudRoutes } from '../../../../shared/utils/crud-factory';
import { generateTtclid } from '../../../../shared/utils/click-id-generator';
import { getDb, testState } from '../index';

export const crudRoutes = createCrudRoutes({
  platform: 'tiktok',
  generateClickId: generateTtclid,
  getDb,
  isRateLimitEnabled: () => testState.crudRateLimitEnabled,
  defaults: {
    campaignObjective: 'WEBSITE_CONVERSIONS',
    campaignStatus: 'ENABLE',
    adGroupStatus: 'ENABLE',
    adStatus: 'ENABLE',
    generateAccountId: () => parseInt(crypto.randomUUID().replace(/-/g, '').slice(0, 13), 16).toString().slice(0, 13).padStart(13, '1'),
    generateCampaignId: () => parseInt(crypto.randomUUID().replace(/-/g, '').slice(0, 13), 16).toString().slice(0, 13).padStart(13, '1'),
    generateAdGroupId: () => parseInt(crypto.randomUUID().replace(/-/g, '').slice(0, 13), 16).toString().slice(0, 13).padStart(13, '1'),
    generateAdId: () => parseInt(crypto.randomUUID().replace(/-/g, '').slice(0, 13), 16).toString().slice(0, 13).padStart(13, '1'),
    generatePixelId: () => `C${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`,
    generateAccessToken: () => `tt_mock_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`,
  },
});
