import { createCrudRoutes } from '../../../../shared/utils/crud-factory';
import { generateScclid } from '../../../../shared/utils/click-id-generator';
import { getDb, testState } from '../index';

// Ad Groups are called "Ad Squads" in Snapchat terminology
export const crudRoutes = createCrudRoutes({
  platform: 'snapchat',
  generateClickId: generateScclid,
  getDb,
  isRateLimitEnabled: () => testState.crudRateLimitEnabled,
  defaults: {
    campaignObjective: 'WEB_CONVERSION',
    campaignStatus: 'ACTIVE',
    adGroupStatus: 'ACTIVE',
    adStatus: 'ACTIVE',
    accountStatus: 'ACTIVE',
    pixelStatus: 'ACTIVE',
    generateAccountId: () => crypto.randomUUID(),
    generateCampaignId: () => crypto.randomUUID(),
    generateAdGroupId: () => crypto.randomUUID(),
    generateAdId: () => `snap_ad_${crypto.randomUUID().slice(0, 12)}`,
    generatePixelId: () => crypto.randomUUID(),
    generateAccessToken: () => `snap_mock_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
  },
});
