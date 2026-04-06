const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Send push notification to a participant via the send-push Edge Function.
 */
export async function sendPushToParticipant(
  participantId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ sent: number; failed: number }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participantId, title, body, data }),
    });

    if (!response.ok) {
      console.error('[push-service] Push notification failed:', await response.text());
      return { sent: 0, failed: 1 };
    }

    return await response.json();
  } catch (error) {
    console.error('[push-service] Error sending push notification:', error);
    return { sent: 0, failed: 1 };
  }
}

/**
 * Process a proximity event for mutual detection and push notifications.
 * Call this after syncing proximity events to the server.
 */
export async function processProximityForPush(
  eventId: string,
  detectorParticipantId: string,
  detectedBeaconMinor: number,
): Promise<{ mutual: boolean; notified: boolean }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-proximity`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId, detectorParticipantId, detectedBeaconMinor }),
    });

    if (!response.ok) {
      console.error('[push-service] Process proximity failed:', await response.text());
      return { mutual: false, notified: false };
    }

    return await response.json();
  } catch (error) {
    console.error('[push-service] Error processing proximity:', error);
    return { mutual: false, notified: false };
  }
}
