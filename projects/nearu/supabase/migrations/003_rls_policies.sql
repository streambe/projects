-- Migration 003: Row Level Security Policies
--
-- SECURITY MODEL:
-- nearU does NOT use Supabase Auth (no JWT/auth.uid()). Auth is via access codes
-- stored in event_participants. Sessions are managed client-side in localStorage.
--
-- This means RLS policies cannot verify "who" is making the request.
-- We use two Supabase keys:
--   - anon key: used by the client app (limited permissions)
--   - service_role key: used by Edge Functions and backoffice (full access, bypasses RLS)
--
-- PRODUCTION HARDENING OPTIONS:
-- 1. Add a custom JWT solution (issue tokens on login, verify in RLS via request headers)
-- 2. Use an API gateway (Next.js API routes on a server) that validates sessions
-- 3. Move all writes behind Edge Functions using service_role key
--

-- ============================================================
-- DROP EXISTING POLICIES (idempotent cleanup from migration 001)
-- ============================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END
$$;

-- ============================================================
-- EVENTS
-- Public read, service_role manages
-- ============================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_anon"
    ON events FOR SELECT
    TO anon, authenticated
    USING (true);

-- INSERT/UPDATE/DELETE: no anon policy -> only service_role (bypasses RLS)

-- ============================================================
-- PARTICIPANTS
-- Public read (needed for nearby cards), anon can create and update
-- NOTE: UPDATE is permissive for MVP. In production, add identity verification.
-- ============================================================

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_select_anon"
    ON participants FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "participants_insert_anon"
    ON participants FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "participants_update_anon"
    ON participants FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE: service_role only

-- ============================================================
-- EVENT_PARTICIPANTS
-- Public read (beacon-to-participant resolution), anon can create and update
-- ============================================================

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_participants_select_anon"
    ON event_participants FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "event_participants_insert_anon"
    ON event_participants FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "event_participants_update_anon"
    ON event_participants FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE: service_role only

-- ============================================================
-- BEACONS
-- Public read, anon can manage (check-in assigns/returns beacons)
-- ============================================================

ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "beacons_select_anon"
    ON beacons FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "beacons_insert_anon"
    ON beacons FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "beacons_update_anon"
    ON beacons FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE: service_role only

-- ============================================================
-- PROXIMITY_EVENTS
-- No public read (raw data), anon can insert (app uploads detections)
-- ============================================================

ALTER TABLE proximity_events ENABLE ROW LEVEL SECURITY;

-- SELECT: service_role only (no anon policy)

CREATE POLICY "proximity_events_insert_anon"
    ON proximity_events FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- UPDATE/DELETE: service_role only

-- ============================================================
-- ENCOUNTERS
-- Public read (history screen), anon can create/update
-- ============================================================

ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encounters_select_anon"
    ON encounters FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "encounters_insert_anon"
    ON encounters FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "encounters_update_anon"
    ON encounters FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE: service_role only

-- ============================================================
-- DEVICE_TOKENS
-- No public read, anon can manage own tokens
-- ============================================================

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- SELECT: service_role only (Edge Functions look up tokens)

CREATE POLICY "device_tokens_insert_anon"
    ON device_tokens FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "device_tokens_update_anon"
    ON device_tokens FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "device_tokens_delete_anon"
    ON device_tokens FOR DELETE
    TO anon, authenticated
    USING (true);

-- ============================================================
-- NOTIFICATIONS
-- Public read (user sees own notifications), service_role creates
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_anon"
    ON notifications FOR SELECT
    TO anon, authenticated
    USING (true);

-- INSERT: service_role only (Edge Functions create notifications)

CREATE POLICY "notifications_update_anon"
    ON notifications FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- DELETE: service_role only
