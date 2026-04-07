import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UpdateUserSchema } from "@/lib/validations/users";

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" as const, currentId: null };
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.is_active || profile.role !== "admin") {
    return { error: "forbidden" as const, currentId: user.id };
  }
  return { ok: true as const, currentId: user.id };
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await ensureAdmin();
  if ("error" in guard) {
    return NextResponse.json(
      { error: guard.error },
      { status: guard.error === "unauthorized" ? 401 : 403 }
    );
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await ensureAdmin();
  if ("error" in guard) {
    return NextResponse.json(
      { error: guard.error },
      { status: guard.error === "unauthorized" ? 401 : 403 }
    );
  }

  const { id } = await ctx.params;

  if (id === guard.currentId) {
    return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Soft delete: mark inactive.
  const { data, error } = await admin
    .from("users")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
