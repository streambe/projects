import { supabase } from '@/lib/supabase';

/**
 * Register (upsert) a device token for push notifications.
 */
export async function registerDeviceToken(
  participantId: string,
  token: string,
  platform: 'ios' | 'android' | 'web',
): Promise<void> {
  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      { participant_id: participantId, token, platform },
      { onConflict: 'participant_id,token' },
    );

  if (error) throw error;
}

/**
 * Remove a device token (e.g. on logout).
 */
export async function removeDeviceToken(token: string): Promise<void> {
  const { error } = await supabase
    .from('device_tokens')
    .delete()
    .eq('token', token);

  if (error) throw error;
}
