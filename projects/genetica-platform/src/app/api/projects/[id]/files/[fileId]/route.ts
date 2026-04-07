import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string; fileId: string }> },
) {
  const { id, fileId } = await ctx.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
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
  const canWrite = profile.role === "admin" || project.owner_id === user.id;
  if (!canWrite) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: file } = await admin
    .from("project_files")
    .select("id, storage_path, project_id")
    .eq("id", fileId)
    .single();
  if (!file || file.project_id !== id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await admin.storage.from("project-files").remove([file.storage_path]);
  const { error: delErr } = await admin
    .from("project_files")
    .delete()
    .eq("id", fileId);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
