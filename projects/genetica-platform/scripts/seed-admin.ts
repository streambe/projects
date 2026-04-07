/* eslint-disable no-console */
/**
 * Seed initial admin user.
 * Usage: npx tsx scripts/seed-admin.ts
 *
 * Reads SUPABASE_URL + SERVICE_ROLE_KEY from .env / .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Minimal .env loader (no extra deps).
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let value = m[2];
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnv();

const ADMIN_EMAIL = "admin@gentica.local";
const ADMIN_PASSWORD = "Admin1234!";
const ADMIN_NAME = "Admin GENTICA";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`> Seeding admin: ${ADMIN_EMAIL}`);

  // Check if user already exists by listing.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) {
    console.error("Failed to list users:", listErr.message);
    process.exit(1);
  }
  const existing = list.users.find((u) => u.email === ADMIN_EMAIL);

  let userId: string;
  if (existing) {
    console.log(`  auth user already exists (id=${existing.id}), updating password…`);
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) {
      console.error("  failed to update:", error.message);
      process.exit(1);
    }
    userId = existing.id;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME },
    });
    if (error || !data.user) {
      console.error("  failed to create auth user:", error?.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`  created auth user (id=${userId})`);
  }

  // Upsert public.users row.
  const { error: upsertErr } = await admin.from("users").upsert(
    {
      id: userId,
      email: ADMIN_EMAIL,
      full_name: ADMIN_NAME,
      role: "admin",
      is_active: true,
    },
    { onConflict: "id" }
  );

  if (upsertErr) {
    console.error("  failed to upsert public.users:", upsertErr.message);
    process.exit(1);
  }

  console.log("✓ Admin seeded");
  console.log(`  email:    ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  console.log("  role:     admin");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
