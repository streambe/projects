import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { advanceQueue } from "@/lib/queue/advance";

export async function POST(
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
  const { data: project, error: fetchErr } = await admin
    .from("projects")
    .select("id, owner_id, status")
    .eq("id", id)
    .single();
  if (fetchErr || !project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const isOwner = project.owner_id === user.id;
  const isAdmin = profile.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: updated, error: updErr } = await admin
    .from("projects")
    .update({
      status: "available",
      owner_id: null,
      owned_at: null,
    })
    .eq("id", id)
    .select()
    .single();

  if (updErr || !updated) {
    return NextResponse.json(
      { error: updErr?.message ?? "release_failed" },
      { status: 500 },
    );
  }

  await admin.from("ownership_history").insert({
    project_id: id,
    user_id: user.id,
    action: "release",
  });

  const notified = await advanceQueue(id);

  return NextResponse.json({ data: updated, queue_notified: notified });
}
