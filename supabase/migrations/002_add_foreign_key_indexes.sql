-- Add indexes on foreign key columns for better query performance

CREATE INDEX idx_pixels_ad_account_id ON mock_pixels(ad_account_id);
CREATE INDEX idx_campaigns_ad_account_id ON mock_campaigns(ad_account_id);
CREATE INDEX idx_ad_groups_campaign_id ON mock_ad_groups(campaign_id);
CREATE INDEX idx_ads_ad_group_id ON mock_ads(ad_group_id);
CREATE INDEX idx_postback_configs_ad_account_id ON mock_postback_configs(ad_account_id);
