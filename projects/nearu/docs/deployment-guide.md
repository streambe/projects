# nearU -- Deployment Guide

**Version:** 1.0
**Date:** 2026-04-05
**Responsible:** Cloud Engineer (Carl Sagan) + DevOps (Margaret Hamilton)

---

## Architecture Overview

```
Mobile App (iOS/Android via Capacitor)
    |
    v
Vercel (Static Export - Next.js)         <-- Web admin + PWA
    |
    v
Supabase (PostgreSQL + Auth + Realtime + Storage)
```

- **Frontend:** Next.js 16 with static export (`output: 'export'`) hosted on Vercel
- **Mobile:** Capacitor 8 wrapping the static export for iOS and Android
- **Backend:** Supabase (database, auth, realtime subscriptions, file storage)
- **App ID:** `com.streambe.nearu`

---

## A. Supabase Setup

### A1. Create Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose organization, set project name to `nearu`, pick region closest to your users (e.g., `South America (Sao Paulo)` for LATAM).
4. Set a strong database password and save it securely.
5. Wait for the project to finish provisioning.

### A2. Run Migrations

Run the two migration files in order via the **SQL Editor** (Dashboard > SQL Editor > New query):

**Migration 1 -- Initial Schema** (`001_initial_schema.sql`):

Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.

This creates: `events`, `participants`, `event_participants`, `beacons`, `proximity_events`, `encounters` tables with indexes.

**Migration 2 -- Device Tokens & Notifications** (`002_device_tokens_notifications.sql`):

Copy and paste the entire contents of `supabase/migrations/002_device_tokens_notifications.sql` and click **Run**.

This creates: `device_tokens`, `notifications` tables with indexes.

### A3. Get API Credentials

1. Go to **Settings > API**.
2. Copy:
   - **Project URL** --> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** --> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### A4. Configure Storage

1. Go to **Storage** in the Supabase dashboard.
2. Create a new bucket named `participant-photos`.
3. Set the bucket to **Public** (photos are displayed in the app).
4. Add a storage policy allowing authenticated uploads:

```sql
-- Allow authenticated users to upload to participant-photos
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'participant-photos');

-- Allow public reads
create policy "Allow public reads"
on storage.objects for select
to public
using (bucket_id = 'participant-photos');
```

### A5. Enable Realtime

1. Go to **Database > Replication**.
2. Enable Realtime for these tables:
   - `proximity_events` (live proximity feed)
   - `encounters` (encounter updates)
   - `event_participants` (check-in status changes)

### A6. Row Level Security (RLS)

Currently, RLS policies are **permissive** for rapid development. Before production launch:

- Enable RLS on all tables.
- Add policies restricting access by `auth.uid()` and event membership.
- At minimum, restrict `events` write to `created_by = auth.uid()`.
- Restrict `proximity_events` and `encounters` to event participants only.

> **TODO:** Create `003_rls_policies.sql` migration before public launch.

---

## B. Vercel Setup

### B1. Import Project

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New > Project**.
3. Import from GitHub: `streambe/projects`.
4. Set **Root Directory** to `projects/nearu`.
5. Framework preset: **Next.js** (auto-detected).

### B2. Build Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `out` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

### B3. Environment Variables

Add these in Vercel project settings (Settings > Environment Variables):

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Production, Preview, Development |

### B4. Custom Domain (Optional)

1. Go to **Settings > Domains**.
2. Add your domain (e.g., `nearu.streambe.com`).
3. Configure DNS as instructed by Vercel (CNAME or A record).

### B5. Deploy

Push to the connected branch. Vercel builds and deploys automatically.

```bash
git push origin project-nearu
```

---

## C. iOS Build

### C1. Prerequisites

- macOS with **Xcode 15+** installed
- Apple Developer account ($99/year)
- Physical iOS device for BLE testing (simulator does not support BLE)
- CocoaPods: `sudo gem install cocoapods`

### C2. Add iOS Platform

```bash
cd projects/nearu
npx cap add ios
npx cap sync ios
```

### C3. Open in Xcode

```bash
npx cap open ios
```

### C4. Configure Signing

1. In Xcode, select the **App** target.
2. Go to **Signing & Capabilities**.
3. Select your Team.
4. Set Bundle Identifier to `com.streambe.nearu`.
5. Xcode will auto-create provisioning profiles.

### C5. Add Required Capabilities

In **Signing & Capabilities**, click **+ Capability** and add:

- **Background Modes** -- enable:
  - `Uses Bluetooth LE accessories` (bluetooth-central)
  - `Location updates`
- **Push Notifications**

### C6. Info.plist Permissions

Add these keys to `ios/App/App/Info.plist` (see `ios-plist-additions.xml` for the XML):

| Key | Value |
|-----|-------|
| `NSBluetoothAlwaysUsageDescription` | nearU uses Bluetooth to detect nearby event participants. |
| `NSBluetoothPeripheralUsageDescription` | nearU uses Bluetooth to broadcast your presence at events. |
| `NSLocationWhenInUseUsageDescription` | nearU uses your location to enhance proximity detection at events. |
| `NSLocationAlwaysAndWhenInUseUsageDescription` | nearU uses background location to maintain proximity detection during events. |

### C7. Build and Test

1. Connect a physical iOS device.
2. Select the device in Xcode's toolbar.
3. Click **Run** (Cmd+R).
4. Test BLE scanning and proximity detection with real beacons.

### C8. Archive and Distribute

1. Set scheme to **Release**.
2. **Product > Archive**.
3. In the Organizer, click **Distribute App**.
4. Select **App Store Connect**.
5. Upload.
6. In App Store Connect, create the app listing and submit to **TestFlight** for beta testing.

---

## D. Android Build

### D1. Prerequisites

- **Android Studio** (latest stable)
- **JDK 17+**
- Physical Android device for BLE testing
- Google Play Developer account ($25 one-time)

### D2. Add Android Platform

```bash
cd projects/nearu
npx cap add android
npx cap sync android
```

### D3. Open in Android Studio

```bash
npx cap open android
```

### D4. Permissions

Add to `android/app/src/main/AndroidManifest.xml` (see `android-manifest-additions.xml` for the XML):

- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT`
- `BLUETOOTH_ADVERTISE`
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `FOREGROUND_SERVICE`

### D5. SDK Versions

In `android/app/build.gradle`, verify:

```groovy
android {
    compileSdkVersion 34
    defaultConfig {
        minSdkVersion 23    // BLE requires API 23+
        targetSdkVersion 34
    }
}
```

### D6. Build Signed APK/AAB

1. In Android Studio: **Build > Generate Signed Bundle / APK**.
2. Create a new keystore or use an existing one.
3. Choose **Android App Bundle (AAB)** for Play Store.
4. Build the release variant.

### D7. Upload to Google Play

1. Go to [Google Play Console](https://play.google.com/console).
2. Create a new app.
3. Upload the AAB to **Internal Testing** first.
4. After validation, promote to **Production**.

---

## E. Environment Variables Reference

| Variable | Description | Local | Staging | Production |
|----------|-------------|-------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `http://localhost:54321` or remote | Staging Supabase URL | Production Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Local or remote key | Staging key | Production key |

For local development with Supabase CLI:

```bash
supabase start
# Use the local URL and anon key output by the command
```

---

## F. Pre-deploy Checklist

- [ ] Supabase project created
- [ ] Migration `001_initial_schema.sql` executed successfully
- [ ] Migration `002_device_tokens_notifications.sql` executed successfully
- [ ] Storage bucket `participant-photos` created with public read policy
- [ ] Realtime enabled on `proximity_events`, `encounters`, `event_participants`
- [ ] Environment variables set in Vercel
- [ ] Vercel build succeeds (check deployment logs)
- [ ] iOS provisioning profiles and signing configured
- [ ] iOS Info.plist has all BLE and location permission descriptions
- [ ] iOS Background Modes capability added (bluetooth-central, location)
- [ ] Android signing keystore created and secured
- [ ] Android manifest has BLE + location permissions
- [ ] Android minSdkVersion set to 23+
- [ ] Push notification certificates configured (APNs for iOS, FCM for Android)
- [ ] BLE tested on physical devices with real beacons
- [ ] RLS policies reviewed and tightened before public launch

---

## G. Troubleshooting

### BLE Issues

| Problem | Solution |
|---------|----------|
| BLE scanning returns no results | Ensure Bluetooth is enabled on device. Check that permission prompts were accepted. On Android, location must also be enabled. |
| BLE works in foreground but not background | Verify Background Modes capability includes `bluetooth-central` (iOS). On Android, use a foreground service. |
| Inconsistent RSSI values | Normal for BLE. Use averaging over multiple readings. Distance estimation is approximate. |
| iOS simulator shows no BLE | BLE is not supported in iOS Simulator. Use a physical device. |

### Capacitor Issues

| Problem | Solution |
|---------|----------|
| `npx cap sync` fails | Run `npm run build` first to generate the `out/` directory. |
| White screen on mobile | Check browser console via Safari (iOS) or Chrome (Android) remote debugging. Usually a missing env var. |
| Plugins not found at runtime | Run `npx cap sync` after installing any new Capacitor plugin. |
| Build fails after Next.js upgrade | Ensure `output: 'export'` is set in `next.config.ts`. Capacitor requires static export. |

### Supabase Issues

| Problem | Solution |
|---------|----------|
| `relation does not exist` | Migrations not run. Execute both SQL files in order in the SQL Editor. |
| Realtime not receiving events | Check that Realtime is enabled for the table in Database > Replication. |
| Storage upload fails | Verify the storage policy allows inserts. Check bucket name matches exactly. |
| Auth not working | Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct and not empty. |

### Vercel Issues

| Problem | Solution |
|---------|----------|
| Build fails with `output: 'export'` errors | Some Next.js features (API routes, middleware, ISR) are not compatible with static export. Remove them. |
| Environment variables not available | Variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser. Redeploy after adding vars. |
| Root directory wrong | Set root directory to `projects/nearu` in Vercel project settings. |

---

## URLs

| Environment | URL |
|-------------|-----|
| Production (Vercel) | TBD -- set after first deploy |
| Supabase Dashboard | `https://supabase.com/dashboard/project/[project-id]` |
| App Store Connect | `https://appstoreconnect.apple.com` |
| Google Play Console | `https://play.google.com/console` |
