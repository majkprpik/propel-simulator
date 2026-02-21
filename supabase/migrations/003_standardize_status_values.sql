-- Standardize status values to uppercase across all tables

-- Uppercase all existing lowercase status values
UPDATE mock_ad_accounts SET status = UPPER(status) WHERE status != UPPER(status);
UPDATE mock_pixels SET status = UPPER(status) WHERE status != UPPER(status);
UPDATE mock_campaigns SET status = UPPER(status) WHERE status != UPPER(status);
UPDATE mock_ad_groups SET status = UPPER(status) WHERE status != UPPER(status);
UPDATE mock_ads SET status = UPPER(status) WHERE status != UPPER(status);

-- Change column defaults to uppercase
ALTER TABLE mock_ad_accounts ALTER COLUMN status SET DEFAULT 'ACTIVE';
ALTER TABLE mock_pixels ALTER COLUMN status SET DEFAULT 'ACTIVE';
ALTER TABLE mock_campaigns ALTER COLUMN status SET DEFAULT 'ACTIVE';
ALTER TABLE mock_ad_groups ALTER COLUMN status SET DEFAULT 'ACTIVE';
ALTER TABLE mock_ads ALTER COLUMN status SET DEFAULT 'ACTIVE';

-- Add CHECK constraints for allowed status values
ALTER TABLE mock_ad_accounts ADD CONSTRAINT chk_account_status
  CHECK (status IN ('ACTIVE', 'PAUSED', 'DISABLED'));

ALTER TABLE mock_pixels ADD CONSTRAINT chk_pixel_status
  CHECK (status IN ('ACTIVE', 'PAUSED', 'DISABLED'));

ALTER TABLE mock_campaigns ADD CONSTRAINT chk_campaign_status
  CHECK (status IN ('ACTIVE', 'PAUSED', 'ENABLED', 'ENABLE', 'ARCHIVED'));

ALTER TABLE mock_ad_groups ADD CONSTRAINT chk_ad_group_status
  CHECK (status IN ('ACTIVE', 'PAUSED', 'ENABLED', 'ENABLE', 'ARCHIVED'));

ALTER TABLE mock_ads ADD CONSTRAINT chk_ad_status
  CHECK (status IN ('ACTIVE', 'PAUSED', 'ENABLED', 'ENABLE', 'ARCHIVED'));
