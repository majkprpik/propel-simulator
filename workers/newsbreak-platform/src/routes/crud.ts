import { createCrudRoutes } from '../../../../shared/utils/crud-factory';
import { generateNbclid } from '../../../../shared/utils/click-id-generator';
import { getDb, testState } from '../index';

// Ad Groups (NewsBreak calls them "ads" but we still store in ad_groups)
export const crudRoutes = createCrudRoutes({
  platform: 'newsbreak',
  generateClickId: generateNbclid,
  getDb,
  isRateLimitEnabled: () => testState.crudRateLimitEnabled,
  defaults: {
    campaignObjective: 'TRAFFIC',
    campaignStatus: 'active',
    adGroupStatus: 'active',
    adStatus: 'active',
    generateAccountId: () => `nb_${crypto.randomUUID().slice(0, 12)}`,
    generateCampaignId: () => `nb_camp_${crypto.randomUUID().slice(0, 10)}`,
    generateAdGroupId: () => `nb_ad_${crypto.randomUUID().slice(0, 10)}`,
    generateAdId: () => `nb_ad_${crypto.randomUUID().slice(0, 12)}`,
    generatePixelId: () => `nb_px_${crypto.randomUUID().slice(0, 10)}`,
    generateAccessToken: () => `nb_token_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`,
  },
});
