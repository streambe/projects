import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
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

  const form = await request.formData();
  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const uploaded: { filename: string; storage_path: string }[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${id}/${Date.now()}_${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from("project-files")
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      console.error("[upload] failed:", upErr);
      continue;
    }
    const { error: rowErr } = await admin.from("project_files").insert({
      project_id: id,
      filename: file.name,
      storage_path: path,
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_by: user.id,
    });
    if (rowErr) {
      console.error("[upload] row failed:", rowErr);
      continue;
    }
    uploaded.push({ filename: file.name, storage_path: path });
  }

  return NextResponse.json({ data: uploaded }, { status: 201 });
}
