-- Migration 004: Push notification support
--
-- NOTE: Automatic triggers for push notifications.
-- Option A (recommended): Call process-proximity Edge Function from client after syncing proximity events
-- Option B: Set up Supabase Database Webhook on proximity_events INSERT -> process-proximity function
--
-- This migration adds helper columns and indexes for push notification queries.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'sent_at'
    ) THEN
        ALTER TABLE notifications ADD COLUMN sent_at timestamptz DEFAULT now();
    END IF;
END
$$;

-- Index for checking recent notifications (anti-spam: 5-minute cooldown)
CREATE INDEX IF NOT EXISTS idx_notifications_participant_created
    ON notifications (participant_id, created_at DESC);

-- Index for proximity event reverse-detection lookup
CREATE INDEX IF NOT EXISTS idx_proximity_reverse_lookup
    ON proximity_events (event_id, detector_participant_id, detected_beacon_minor, detected_at DESC);

COMMENT ON TABLE proximity_events IS 'Raw BLE detections. Configure Supabase Database Webhook on INSERT to call process-proximity Edge Function for mutual detection and push notifications.';
