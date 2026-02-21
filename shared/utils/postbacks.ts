import type { SupabaseClient } from '@supabase/supabase-js';

interface PostbackParams {
  platform: string;
  pixel_id: string;
  event_name: string;
  event_data: Record<string, unknown>;
}

/**
 * Triggers postback webhooks for matching active configs after an event is stored.
 * Errors are logged but never propagated - event storage should not fail due to postbacks.
 */
export async function triggerPostbacks(
  db: SupabaseClient,
  params: PostbackParams,
): Promise<void> {
  try {
    // Find the ad_account_id for this pixel
    const { data: pixel } = await db
      .from('mock_pixels')
      .select('ad_account_id')
      .eq('platform', params.platform)
      .eq('pixel_id', params.pixel_id)
      .single();

    if (!pixel) return;

    // Query matching active postback configs
    const { data: configs } = await db
      .from('mock_postback_configs')
      .select('id, postback_url')
      .eq('platform', params.platform)
      .eq('ad_account_id', pixel.ad_account_id)
      .eq('event_name', params.event_name)
      .eq('is_active', true);

    if (!configs || configs.length === 0) return;

    // Fire all postbacks in parallel
    await Promise.allSettled(
      configs.map(async (config) => {
        try {
          await fetch(config.postback_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform: params.platform,
              pixel_id: params.pixel_id,
              event_name: params.event_name,
              event_data: params.event_data,
              postback_config_id: config.id,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (err) {
          console.error(`Postback failed for config ${config.id}:`, err);
        }
      }),
    );
  } catch (err) {
    console.error('Error triggering postbacks:', err);
  }
}
