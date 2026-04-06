import { supabase } from '@/lib/supabase';

/**
 * Send a push notification to a participant.
 *
 * MVP implementation: logs to console and stores in the notifications table.
 *
 * Production implementation would:
 * 1. Fetch all device_tokens for the participant
 * 2. For each token, send via FCM (Android/Web) or APNs (iOS)
 * 3. Mark notification as delivered
 *
 * This would be implemented as a Supabase Edge Function:
 *   - POST /functions/v1/send-push
 *   - Body: { participantId, title, body, data? }
 *   - The function fetches tokens from device_tokens table
 *   - Sends via firebase-admin SDK (FCM) or @parse/node-apn (APNs)
 *   - Updates notifications table with delivered=true
 */
export async function sendPushToParticipant(
  participantId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  console.log(
    `[push-service] Would send to ${participantId}: "${title}" - "${body}"`,
  );

  // Store in notifications table for history
  const { error } = await supabase.from('notifications').insert({
    participant_id: participantId,
    title,
    body,
    data: data ?? null,
    delivered: false,
  });

  if (error) {
    console.error('[push-service] Failed to store notification:', error);
  }
}
