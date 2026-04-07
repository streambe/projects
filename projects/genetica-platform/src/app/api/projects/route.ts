import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreateProjectSchema } from "@/lib/validations/projects";

async function requireActiveUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" as const };
  const { data: profile } = await supabase
    .from("users")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.is_active) return { error: "forbidden" as const };
  return { ok: true as const, userId: user.id, role: profile.role };
}

export async function POST(request: Request) {
  const guard = await requireActiveUser();
  if ("error" in guard) {
    return NextResponse.json(
      { error: guard.error },
      { status: guard.error === "unauthorized" ? 401 : 403 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  let payload: Record<string, unknown> = {};
  let files: File[] = [];

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    payload = {
      name: form.get("name"),
      description: form.get("description") || undefined,
      claude_model: form.get("claude_model") || "claude-sonnet-4-6",
      cost_cap_usd: form.get("cost_cap_usd") || 50,
    };
    files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  } else {
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
  }

  const parsed = CreateProjectSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const admin = createAdminClient();

  const { data: project, error: insertErr } = await admin
    .from("projects")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      claude_model: parsed.data.claude_model,
      cost_cap_usd: parsed.data.cost_cap_usd,
      status: "available",
      owner_id: null,
      created_by: guard.userId,
    })
    .select()
    .single();

  if (insertErr || !project) {
    console.error("[create-project] insert failed:", insertErr);
    return NextResponse.json(
      { error: insertErr?.message ?? "insert_failed" },
      { status: 500 },
    );
  }

  // Upload files (best-effort)
  const uploadedFiles: { filename: string; storage_path: string }[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${project.id}/${Date.now()}_${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from("project-files")
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      console.error("[create-project] upload failed:", upErr);
      continue;
    }
    const { error: rowErr } = await admin.from("project_files").insert({
      project_id: project.id,
      filename: file.name,
      storage_path: path,
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_by: guard.userId,
    });
    if (rowErr) {
      console.error("[create-project] file row insert failed:", rowErr);
      continue;
    }
    uploadedFiles.push({ filename: file.name, storage_path: path });
  }

  return NextResponse.json(
    { data: { project, files: uploadedFiles } },
    { status: 201 },
  );
}
