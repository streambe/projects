import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreateUserSchema } from "@/lib/validations/users";

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" as const };
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.is_active || profile.role !== "admin") {
    return { error: "forbidden" as const };
  }
  return { ok: true as const };
}

export async function GET() {
  const guard = await ensureAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.error === "unauthorized" ? 401 : 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const guard = await ensureAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.error === "unauthorized" ? 401 : 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const admin = createAdminClient();

  // 1. Create the auth user.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });

  if (createErr || !created.user) {
    console.error("[create-user] auth.admin.createUser failed:", createErr);
    return NextResponse.json(
      { error: createErr?.message ?? "create_auth_failed" },
      { status: 400 }
    );
  }

  // 2. Insert the public.users row with the same id.
  const { data: profile, error: profileErr } = await admin
    .from("users")
    .insert({
      id: created.user.id,
      email: parsed.data.email,
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      is_active: true,
    })
    .select()
    .single();

  if (profileErr) {
    console.error("[create-user] insert public.users failed:", profileErr);
    // Rollback auth user.
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileErr.message, details: profileErr }, { status: 500 });
  }

  return NextResponse.json({ data: profile }, { status: 201 });
}
