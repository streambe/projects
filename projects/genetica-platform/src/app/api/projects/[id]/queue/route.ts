import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { removeAndCompact } from "@/lib/queue/advance";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("users")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.is_active) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id, owner_id")
    .eq("id", id)
    .single();
  if (!project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const isAdmin = profile.role === "admin";
  const isOwner = project.owner_id === user.id;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: entries } = await admin
    .from("project_queue")
    .select("*")
    .eq("project_id", id)
    .order("position", { ascending: true });

  const userIds = Array.from(new Set((entries ?? []).map((e) => e.user_id)));
  const usersMap = new Map<string, { id: string; full_name: string; email: string }>();
  if (userIds.length > 0) {
    const { data: users } = await admin
      .from("users")
      .select("id, full_name, email")
      .in("id", userIds);
    for (const u of users ?? []) usersMap.set(u.id, u);
  }

  const enriched = (entries ?? []).map((e) => ({
    ...e,
    user: usersMap.get(e.user_id) ?? null,
  }));

  return NextResponse.json({ data: enriched });
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: entry } = await admin
    .from("project_queue")
    .select("id")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!entry) {
    return NextResponse.json({ error: "not_in_queue" }, { status: 404 });
  }

  await removeAndCompact(entry.id);
  return NextResponse.json({ ok: true });
}
