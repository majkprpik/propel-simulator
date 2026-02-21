import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import parseArgs from 'minimist';

// ── Types ──────────────────────────────────────────────────────────────

type Platform = 'facebook' | 'google' | 'tiktok' | 'snapchat' | 'newsbreak';
const ALL_PLATFORMS: Platform[] = ['facebook', 'google', 'tiktok', 'snapchat', 'newsbreak'];
type AnyPlatform = Platform | 'everflow';

interface SeedOptions {
  platform: Platform;
  campaigns: number;
  adSetsPerCampaign: number;
  adsPerAdSet: number;
  pixels: number;
  dailyBudget: number;
}

// ── Platform Config ────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<Platform, {
  accountName: string;
  accountId: () => string;
  campaignId: () => string;
  adGroupId: () => string;
  adId: () => string;
  pixelId: (accountId?: string) => string;
  accessToken: () => string | null;
  clickId: () => string;
  campaignStatus: string;
  adGroupStatus: string;
  adStatus: string;
  accountStatus: string;
  pixelStatus: string;
  objective: string;
  adGroupLabel: string;
  pixelLabel: string;
}> = {
  facebook: {
    accountName: 'Facebook Account',
    accountId: () => `act_${randomUUID().slice(0, 12)}`,
    campaignId: () => `camp_${randomUUID().slice(0, 12)}`,
    adGroupId: () => `adset_${randomUUID().slice(0, 12)}`,
    adId: () => `fb_ad_${randomUUID().slice(0, 12)}`,
    pixelId: () => `px_${randomUUID().slice(0, 12)}`,
    accessToken: () => `EAAMock${randomUUID().replace(/-/g, '').slice(0, 24)}`,
    clickId: () => `fb.1.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`,
    campaignStatus: 'ACTIVE',
    adGroupStatus: 'ACTIVE',
    adStatus: 'active',
    accountStatus: 'active',
    pixelStatus: 'active',
    objective: 'CONVERSIONS',
    adGroupLabel: 'Ad Set',
    pixelLabel: 'Pixel',
  },
  google: {
    accountName: 'Google Ads Account',
    accountId: () => `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    campaignId: () => `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
    adGroupId: () => `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
    adId: () => `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
    pixelId: (accountId) => `customers/${accountId}/conversionActions/${Math.floor(Math.random() * 900000000) + 100000000}`,
    accessToken: () => null,
    clickId: () => `Cj0KCQjw${randomUUID().replace(/-/g, '').slice(0, 20)}`,
    campaignStatus: 'ENABLED',
    adGroupStatus: 'ENABLED',
    adStatus: 'active',
    accountStatus: 'active',
    pixelStatus: 'active',
    objective: 'SEARCH',
    adGroupLabel: 'Ad Group',
    pixelLabel: 'Conversion Action',
  },
  tiktok: {
    accountName: 'TikTok Ads Account',
    accountId: () => `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    campaignId: () => `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    adGroupId: () => `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    adId: () => `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    pixelId: () => `C${Math.random().toString().slice(2, 22)}`,
    accessToken: () => `tt_mock_${randomUUID().replace(/-/g, '').slice(0, 32)}`,
    clickId: () => `E.C.P.${randomUUID().replace(/-/g, '').slice(0, 24)}`,
    campaignStatus: 'ENABLE',
    adGroupStatus: 'ENABLE',
    adStatus: 'active',
    accountStatus: 'active',
    pixelStatus: 'active',
    objective: 'WEBSITE_CONVERSIONS',
    adGroupLabel: 'Ad Group',
    pixelLabel: 'Pixel',
  },
  snapchat: {
    accountName: 'Snapchat Ad Account',
    accountId: () => randomUUID(),
    campaignId: () => randomUUID(),
    adGroupId: () => randomUUID(),
    adId: () => `snap_ad_${randomUUID().slice(0, 12)}`,
    pixelId: () => randomUUID(),
    accessToken: () => `snap_mock_${randomUUID().replace(/-/g, '').slice(0, 24)}`,
    clickId: () => `snap_${randomUUID().replace(/-/g, '')}`,
    campaignStatus: 'ACTIVE',
    adGroupStatus: 'ACTIVE',
    adStatus: 'active',
    accountStatus: 'ACTIVE',
    pixelStatus: 'ACTIVE',
    objective: 'WEB_CONVERSION',
    adGroupLabel: 'Ad Squad',
    pixelLabel: 'Snap Pixel',
  },
  newsbreak: {
    accountName: 'NewsBreak Account',
    accountId: () => `nb_${randomUUID().slice(0, 12)}`,
    campaignId: () => `nb_camp_${randomUUID().slice(0, 10)}`,
    adGroupId: () => `nb_ad_${randomUUID().slice(0, 10)}`,
    adId: () => `nb_ad_${randomUUID().slice(0, 12)}`,
    pixelId: () => `nb_px_${randomUUID().slice(0, 10)}`,
    accessToken: () => `nb_token_${randomUUID().replace(/-/g, '').slice(0, 24)}`,
    clickId: () => `nb_click_${randomUUID().slice(0, 16)}`,
    campaignStatus: 'active',
    adGroupStatus: 'active',
    adStatus: 'active',
    accountStatus: 'active',
    pixelStatus: 'active',
    objective: 'TRAFFIC',
    adGroupLabel: 'Ad Group',
    pixelLabel: 'Pixel',
  },
};

// ── Supabase Client ────────────────────────────────────────────────────

function loadEnv(): { url: string; key: string } {
  const devVarsPath = resolve(import.meta.dirname!, '..', 'workers', 'facebook-platform', '.dev.vars');
  const content = readFileSync(devVarsPath, 'utf-8');
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  if (!vars.SUPABASE_URL || !vars.SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in workers/facebook-platform/.dev.vars');
    process.exit(1);
  }
  return { url: vars.SUPABASE_URL, key: vars.SUPABASE_SERVICE_KEY };
}

function createDb(): SupabaseClient {
  const { url, key } = loadEnv();
  return createClient(url, key);
}

// ── Seed Command ───────────────────────────────────────────────────────

async function seedPlatform(db: SupabaseClient, opts: SeedOptions): Promise<void> {
  const cfg = PLATFORM_CONFIG[opts.platform];
  console.log(`\nSeeding ${opts.platform}...`);

  // 1. Create account
  const accountId = cfg.accountId();
  const { data: account, error: accErr } = await db
    .from('mock_ad_accounts')
    .insert({
      platform: opts.platform,
      account_id: accountId,
      name: `${cfg.accountName} (Seed)`,
      currency: 'USD',
      status: cfg.accountStatus,
    })
    .select()
    .single();
  if (accErr) throw new Error(`Account create failed: ${accErr.message}`);
  console.log(`  Account: ${accountId} (${account.name})`);

  // 2. Create pixels
  const pixelIds: string[] = [];
  for (let p = 0; p < opts.pixels; p++) {
    const pixelId = cfg.pixelId(accountId);
    const { error: pxErr } = await db.from('mock_pixels').insert({
      platform: opts.platform,
      ad_account_id: account.id,
      pixel_id: pixelId,
      name: `${cfg.pixelLabel} ${p + 1} (Seed)`,
      access_token: cfg.accessToken(),
      status: cfg.pixelStatus,
    });
    if (pxErr) throw new Error(`Pixel create failed: ${pxErr.message}`);
    pixelIds.push(pixelId);
    console.log(`  ${cfg.pixelLabel}: ${pixelId}`);
  }

  // 3. Create campaigns → ad groups → ads
  for (let c = 0; c < opts.campaigns; c++) {
    const campaignPlatformId = cfg.campaignId();
    const { data: campaign, error: campErr } = await db
      .from('mock_campaigns')
      .insert({
        platform: opts.platform,
        ad_account_id: account.id,
        campaign_id: campaignPlatformId,
        name: `Campaign ${c + 1} (Seed)`,
        objective: cfg.objective,
        status: cfg.campaignStatus,
        daily_budget: opts.dailyBudget,
      })
      .select()
      .single();
    if (campErr) throw new Error(`Campaign create failed: ${campErr.message}`);
    console.log(`  Campaign: ${campaignPlatformId} — ${campaign.name}`);

    for (let ag = 0; ag < opts.adSetsPerCampaign; ag++) {
      const adGroupPlatformId = cfg.adGroupId();
      const { data: adGroup, error: agErr } = await db
        .from('mock_ad_groups')
        .insert({
          platform: opts.platform,
          campaign_id: campaign.id,
          ad_group_id: adGroupPlatformId,
          name: `${cfg.adGroupLabel} ${ag + 1} (Seed)`,
          status: cfg.adGroupStatus,
          bid_amount: 5.0,
        })
        .select()
        .single();
      if (agErr) throw new Error(`Ad group create failed: ${agErr.message}`);
      console.log(`    ${cfg.adGroupLabel}: ${adGroupPlatformId}`);

      for (let a = 0; a < opts.adsPerAdSet; a++) {
        const adPlatformId = cfg.adId();
        const { error: adErr } = await db.from('mock_ads').insert({
          platform: opts.platform,
          ad_group_id: adGroup.id,
          ad_id: adPlatformId,
          name: `Ad ${a + 1} (Seed)`,
          destination_url: `https://example.com/${opts.platform}/landing-${c + 1}-${ag + 1}-${a + 1}`,
          status: cfg.adStatus,
        });
        if (adErr) throw new Error(`Ad create failed: ${adErr.message}`);
        console.log(`      Ad: ${adPlatformId}`);
      }
    }
  }

  const totalAds = opts.campaigns * opts.adSetsPerCampaign * opts.adsPerAdSet;
  const totalAdGroups = opts.campaigns * opts.adSetsPerCampaign;
  console.log(`\n✓ ${opts.platform}: 1 account, ${opts.pixels} ${cfg.pixelLabel.toLowerCase()}(s), ${opts.campaigns} campaign(s), ${totalAdGroups} ${cfg.adGroupLabel.toLowerCase()}(s), ${totalAds} ad(s)`);
}

// ── Status Command ─────────────────────────────────────────────────────

async function showStatus(db: SupabaseClient, platform?: Platform): Promise<void> {
  const platforms = platform ? [platform] : ALL_PLATFORMS;

  for (const p of platforms) {
    const [accounts, campaigns, adGroups, ads, pixels, events, clicks] = await Promise.all([
      db.from('mock_ad_accounts').select('*', { count: 'exact', head: true }).eq('platform', p),
      db.from('mock_campaigns').select('*', { count: 'exact', head: true }).eq('platform', p),
      db.from('mock_ad_groups').select('*', { count: 'exact', head: true }).eq('platform', p),
      db.from('mock_ads').select('*', { count: 'exact', head: true }).eq('platform', p),
      db.from('mock_pixels').select('*', { count: 'exact', head: true }).eq('platform', p),
      db.from('mock_events').select('*', { count: 'exact', head: true }).eq('platform', p),
      db.from('mock_clicks').select('*', { count: 'exact', head: true }).eq('platform', p),
    ]);

    const cfg = PLATFORM_CONFIG[p];
    const total = (accounts.count ?? 0) + (campaigns.count ?? 0) + (adGroups.count ?? 0) +
      (ads.count ?? 0) + (pixels.count ?? 0) + (events.count ?? 0) + (clicks.count ?? 0);

    const pad = (label: string) => label.padEnd(24);
    console.log(`\n${p.toUpperCase()}`);
    console.log(`  ${pad('Accounts:')}${accounts.count ?? 0}`);
    console.log(`  ${pad('Campaigns:')}${campaigns.count ?? 0}`);
    console.log(`  ${pad(`${cfg.adGroupLabel}s:`)}${adGroups.count ?? 0}`);
    console.log(`  ${pad('Ads:')}${ads.count ?? 0}`);
    console.log(`  ${pad(`${cfg.pixelLabel}s:`)}${pixels.count ?? 0}`);
    console.log(`  ${pad('Events:')}${events.count ?? 0}`);
    console.log(`  ${pad('Clicks:')}${clicks.count ?? 0}`);
    if (total === 0) console.log(`  (empty)`);
  }
}

// ── Clear Command ──────────────────────────────────────────────────────

async function clearPlatform(db: SupabaseClient, platform: Platform): Promise<void> {
  console.log(`Clearing ${platform} data...`);

  // Delete in dependency order (children first)
  const tables = [
    'mock_events',
    'mock_clicks',
    'mock_postback_configs',
    'mock_ads',
    'mock_ad_groups',
    'mock_campaigns',
    'mock_pixels',
    'mock_ad_accounts',
  ];

  for (const table of tables) {
    const { error } = await db.from(table).delete().eq('platform', platform);
    if (error) console.error(`  Warning: failed to clear ${table}: ${error.message}`);
  }

  console.log(`✓ Cleared all ${platform} data`);
}

async function clearAll(db: SupabaseClient): Promise<void> {
  for (const p of ALL_PLATFORMS) {
    await clearPlatform(db, p);
  }
}

// ── Event Command ──────────────────────────────────────────────────────

async function fireEvent(
  db: SupabaseClient,
  platform: Platform,
  pixelId: string,
  eventName: string,
  value?: number,
): Promise<void> {
  const eventId = `seed_evt_${randomUUID().slice(0, 16)}`;
  const { error } = await db.from('mock_events').insert({
    platform,
    pixel_id: pixelId,
    event_name: eventName,
    event_id: eventId,
    event_time: new Date().toISOString(),
    value: value ?? null,
    currency: value ? 'USD' : null,
    received_at: new Date().toISOString(),
    request_payload: { source: 'seed-cli', event_name: eventName, value },
  });
  if (error) throw new Error(`Event create failed: ${error.message}`);
  console.log(`✓ Event fired: ${eventName} (${eventId}) on pixel ${pixelId}${value ? ` — $${value}` : ''}`);
}

// ── Clicks Command ─────────────────────────────────────────────────────

async function generateClicks(
  db: SupabaseClient,
  platform: Platform,
  count: number,
): Promise<void> {
  const cfg = PLATFORM_CONFIG[platform];

  // Get existing ads to associate clicks with
  const { data: ads } = await db
    .from('mock_ads')
    .select('ad_id, ad_group_id')
    .eq('platform', platform)
    .limit(50);

  // Get campaign/ad_group IDs for the ads
  const adGroupUuids = [...new Set((ads ?? []).map(a => a.ad_group_id).filter(Boolean))];
  const { data: adGroups } = await db
    .from('mock_ad_groups')
    .select('id, ad_group_id, campaign_id')
    .in('id', adGroupUuids.length > 0 ? adGroupUuids : ['__none__']);

  const campaignUuids = [...new Set((adGroups ?? []).map(ag => ag.campaign_id).filter(Boolean))];
  const { data: campaigns } = await db
    .from('mock_campaigns')
    .select('id, campaign_id')
    .in('id', campaignUuids.length > 0 ? campaignUuids : ['__none__']);

  const campaignMap = new Map((campaigns ?? []).map(c => [c.id, c.campaign_id]));
  const adGroupMap = new Map((adGroups ?? []).map(ag => [ag.id, { adGroupId: ag.ad_group_id, campaignUuid: ag.campaign_id }]));

  const clicks = [];
  for (let i = 0; i < count; i++) {
    const ad = ads && ads.length > 0 ? ads[i % ads.length] : null;
    const agInfo = ad?.ad_group_id ? adGroupMap.get(ad.ad_group_id) : null;
    const campaignId = agInfo?.campaignUuid ? campaignMap.get(agInfo.campaignUuid) : null;

    clicks.push({
      platform,
      click_id: cfg.clickId(),
      campaign_id: campaignId ?? null,
      ad_group_id: agInfo?.adGroupId ?? null,
      ad_id: ad?.ad_id ?? null,
      destination_url: `https://example.com/${platform}/landing`,
    });
  }

  const { error } = await db.from('mock_clicks').insert(clicks);
  if (error) throw new Error(`Click generation failed: ${error.message}`);
  console.log(`✓ Generated ${count} click(s) for ${platform}`);
}

// ── Everflow Seed Commands ─────────────────────────────────────────────

function generateEfTransactionId(): string {
  const bytes = Buffer.from(randomUUID().replace(/-/g, ''), 'hex');
  return `ef_${bytes.slice(0, 8).toString('hex')}`;
}

async function seedEverflow(db: SupabaseClient, offers: number): Promise<void> {
  console.log('\nSeeding everflow...');

  const accountId = 'ef_net_001';
  const networkId = 'ef_network_001';

  const { data: account, error: accErr } = await db
    .from('mock_ef_accounts')
    .insert({
      account_id: accountId,
      name: 'Everflow Mock Network (Seed)',
      network_id: networkId,
      api_key: 'mock-ef-api-key',
      status: 'active',
    })
    .select()
    .single();
  if (accErr) throw new Error(`EF account create failed: ${accErr.message}`);
  console.log(`  Account: ${accountId} (${account.name})`);

  const payoutTypes = ['CPA', 'CPL', 'CPS', 'RevShare'];
  const statuses = ['active', 'active', 'active', 'paused', 'active']; // mostly active
  const offerRecords = Array.from({ length: offers }, (_, i) => ({
    account_id: accountId,
    network_offer_id: 100000 + i + 1,
    offer_id: 100000 + i + 1,
    name: `Offer ${i + 1} — ${payoutTypes[i % payoutTypes.length]} (Seed)`,
    tracking_url: `https://tracking.example.com/click/${100000 + i + 1}`,
    preview_url: `https://example.com/preview/${i + 1}`,
    payout: parseFloat((Math.random() * 20 + 1).toFixed(2)),
    payout_type: payoutTypes[i % payoutTypes.length],
    currency_id: 'USD',
    status: statuses[i % statuses.length],
    description: `Seeded offer ${i + 1} for testing`,
    require_approval: false,
    click_cookie_days: 30,
  }));

  const { error: offerErr } = await db.from('mock_ef_offers').insert(offerRecords);
  if (offerErr) throw new Error(`EF offers create failed: ${offerErr.message}`);
  console.log(`  Offers: ${offers} created`);

  // Generate 10 clicks for the first 2 offers
  const clickOffers = offerRecords.slice(0, 2);
  const clickRecords = Array.from({ length: 10 }, (_, i) => ({
    transaction_id: generateEfTransactionId(),
    offer_id: clickOffers[i % clickOffers.length].network_offer_id,
    affiliate_id: `aff_${Math.floor(Math.random() * 9000) + 1000}`,
    destination_url: `https://example.com/lander`,
    ip_address: '1.2.3.4',
    user_agent: 'Mozilla/5.0 (Seed)',
    converted: false,
  }));
  const { error: clickErr } = await db.from('mock_ef_clicks').insert(clickRecords);
  if (clickErr) throw new Error(`EF clicks create failed: ${clickErr.message}`);
  console.log(`  Clicks: 10 generated`);

  console.log(`\n✓ everflow: 1 account, ${offers} offers, 10 clicks`);
}

async function clearEverflow(db: SupabaseClient): Promise<void> {
  console.log('Clearing everflow data...');
  const tables = ['mock_ef_postbacks', 'mock_ef_clicks', 'mock_ef_postback_configs', 'mock_ef_offers', 'mock_ef_accounts'];
  for (const table of tables) {
    const { error } = await db.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error(`  Warning: failed to clear ${table}: ${error.message}`);
  }
  console.log('✓ Cleared all everflow data');
}

async function generateEfClicks(db: SupabaseClient, count: number): Promise<void> {
  const { data: offers } = await db.from('mock_ef_offers').select('network_offer_id').eq('status', 'active').limit(5);
  if (!offers || offers.length === 0) {
    throw new Error('No active Everflow offers found. Run seed first.');
  }
  const clicks = Array.from({ length: count }, (_, i) => ({
    transaction_id: generateEfTransactionId(),
    offer_id: offers[i % offers.length].network_offer_id,
    affiliate_id: `aff_${Math.floor(Math.random() * 9000) + 1000}`,
    destination_url: 'https://example.com/lander',
    ip_address: '1.2.3.4',
    user_agent: 'Mozilla/5.0 (Seed)',
    converted: false,
  }));
  const { error } = await db.from('mock_ef_clicks').insert(clicks);
  if (error) throw new Error(`EF click generation failed: ${error.message}`);
  console.log(`✓ Generated ${count} Everflow click(s)`);
}

// ── CLI Router ─────────────────────────────────────────────────────────

function printUsage(): void {
  console.log(`
propel-simulator seed CLI

Usage:
  node seed.js <command> [options]

Commands:
  seed      Create test data hierarchy for a platform
  status    Show current data counts
  clear     Remove data for a platform or all platforms
  event     Fire a test conversion event
  clicks    Generate test click records

Seed Options:
  --platform <name>            Platform (facebook|google|tiktok|snapchat|newsbreak|everflow)
  --campaigns <n>              Number of campaigns (default: 1, not used for everflow)
  --offers <n>                 Number of offers to create (everflow only, default: 5)
  --ad-sets-per-campaign <n>   Ad sets per campaign (default: 1)
  --ads-per-ad-set <n>         Ads per ad set (default: 2)
  --pixels <n>                 Number of pixels (default: 1)
  --daily-budget <n>           Daily budget per campaign (default: 50)

Status Options:
  --platform <name>            Show specific platform (omit for all)

Clear Options:
  --platform <name>            Clear specific platform
  --all                        Clear all platforms

Event Options:
  --platform <name>            Platform
  --pixel-id <id>              Pixel ID to fire event on
  --event-name <name>          Event name (default: Purchase)
  --value <n>                  Event value

Clicks Options:
  --platform <name>            Platform
  --count <n>                  Number of clicks (default: 10)
`);
}

const ALL_ANY_PLATFORMS: AnyPlatform[] = [...ALL_PLATFORMS, 'everflow'];

function validateAnyPlatform(name: string | undefined): AnyPlatform {
  if (!name) {
    console.error('Error: --platform is required');
    process.exit(1);
  }
  if (!ALL_ANY_PLATFORMS.includes(name as AnyPlatform)) {
    console.error(`Error: invalid platform "${name}". Must be one of: ${ALL_ANY_PLATFORMS.join(', ')}`);
    process.exit(1);
  }
  return name as AnyPlatform;
}

function validatePlatform(name: string | undefined): Platform {
  if (!name) {
    console.error('Error: --platform is required');
    process.exit(1);
  }
  if (!ALL_PLATFORMS.includes(name as Platform)) {
    console.error(`Error: invalid platform "${name}". Must be one of: ${ALL_PLATFORMS.join(', ')}`);
    process.exit(1);
  }
  return name as Platform;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2), {
    string: ['platform', 'pixel-id', 'event-name'],
    boolean: ['all', 'help'],
    default: {
      campaigns: 1,
      offers: 5,
      'ad-sets-per-campaign': 1,
      'ads-per-ad-set': 2,
      pixels: 1,
      'daily-budget': 50,
      'event-name': 'Purchase',
      count: 10,
    },
  });

  const command = args._[0] as string | undefined;

  if (!command || args.help) {
    printUsage();
    process.exit(0);
  }

  const db = createDb();

  switch (command) {
    case 'seed': {
      const platform = validateAnyPlatform(args.platform);
      if (platform === 'everflow') {
        await seedEverflow(db, Number(args.offers));
      } else {
        await seedPlatform(db, {
          platform,
          campaigns: Number(args.campaigns),
          adSetsPerCampaign: Number(args['ad-sets-per-campaign']),
          adsPerAdSet: Number(args['ads-per-ad-set']),
          pixels: Number(args.pixels),
          dailyBudget: Number(args['daily-budget']),
        });
      }
      break;
    }
    case 'status': {
      const platform = args.platform ? validatePlatform(args.platform) : undefined;
      await showStatus(db, platform);
      break;
    }
    case 'clear': {
      if (args.all) {
        await clearAll(db);
        await clearEverflow(db);
      } else {
        const platform = validateAnyPlatform(args.platform);
        if (platform === 'everflow') {
          await clearEverflow(db);
        } else {
          await clearPlatform(db, platform);
        }
      }
      break;
    }
    case 'event': {
      const platform = validatePlatform(args.platform);
      const pixelId = args['pixel-id'];
      if (!pixelId) {
        console.error('Error: --pixel-id is required for event command');
        process.exit(1);
      }
      await fireEvent(db, platform, pixelId, args['event-name'], args.value ? Number(args.value) : undefined);
      break;
    }
    case 'clicks': {
      const platform = validateAnyPlatform(args.platform);
      if (platform === 'everflow') {
        await generateEfClicks(db, Number(args.count));
      } else {
        await generateClicks(db, platform, Number(args.count));
      }
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
