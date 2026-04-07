import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ACTIVE_PROJECT_STATUSES,
  MAX_ACTIVE_PROJECTS,
} from "@/lib/validations/projects";
import { removeAndCompact } from "@/lib/queue/advance";

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
  const userId = user.id;
  const { data: profile } = await supabase
    .from("users")
    .select("id, is_active")
    .eq("id", userId)
    .single();
  if (!profile || !profile.is_active) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: project, error: pErr } = await admin
    .from("projects")
    .select("id, status, owner_id")
    .eq("id", id)
    .single();
  if (pErr || !project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  async function enqueueUser() {
    const { data: existing } = await admin
      .from("project_queue")
      .select("id, position")
      .eq("project_id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          queued: true,
          alreadyQueued: true,
          position: existing.position,
          message: `Ya estás en la cola, posición ${existing.position}`,
        },
        { status: 200 },
      );
    }

    const { count } = await admin
      .from("project_queue")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id);

    const position = (count ?? 0) + 1;
    const { error: insErr } = await admin.from("project_queue").insert({
      project_id: id,
      user_id: userId,
      position,
    });
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
    return NextResponse.json(
      {
        queued: true,
        position,
        message: `Agregado a la cola en posición ${position}`,
      },
      { status: 200 },
    );
  }

  const { count: activeCount, error: countErr } = await admin
    .from("projects")
    .select("id", { count: "exact", head: true })
    .in("status", ACTIVE_PROJECT_STATUSES as unknown as string[]);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  const capFull = (activeCount ?? 0) >= MAX_ACTIVE_PROJECTS;

  // Project not available → enqueue.
  if (project.status !== "available") {
    if (project.owner_id === userId) {
      return NextResponse.json(
        { error: "Ya sos owner de este proyecto", code: "already_owner" },
        { status: 409 },
      );
    }
    return enqueueUser();
  }

  // Available but cap full → enqueue.
  if (capFull) {
    return enqueueUser();
  }

  // If queue has a notified head that is NOT this user, enqueue.
  const { data: head } = await admin
    .from("project_queue")
    .select("id, user_id, notified_at, expires_at")
    .eq("project_id", id)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (
    head &&
    head.notified_at &&
    head.expires_at &&
    new Date(head.expires_at) > new Date() &&
    head.user_id !== userId
  ) {
    return enqueueUser();
  }

  const now = new Date().toISOString();
  const { data: updated, error: updErr } = await admin
    .from("projects")
    .update({
      status: "owned",
      owner_id: userId,
      owned_at: now,
      last_interaction_at: now,
    })
    .eq("id", id)
    .eq("status", "available")
    .select()
    .single();

  if (updErr || !updated) {
    return NextResponse.json(
      { error: "Proyecto no disponible", code: "not_available" },
      { status: 409 },
    );
  }

  await admin.from("ownership_history").insert({
    project_id: id,
    user_id: userId,
    action: "claim",
  });

  // Canned welcome message from Alan Turing on first claim. Zero-cost, no API hit.
  const { count: existingMsgs } = await admin
    .from("project_messages")
    .select("id", { count: "exact", head: true })
    .eq("project_id", id)
    .eq("role", "assistant");
  if ((existingMsgs ?? 0) === 0) {
    const welcome =
      `Hola, soy Alan Turing, PM del equipo GEN. Bienvenido al proyecto ${updated.name}. ` +
      (updated.description
        ? `${updated.description}. `
        : "") +
      `¿Empezamos con el relevamiento de requerimientos o ya tenés algo definido?`;
    await admin.from("project_messages").insert({
      project_id: id,
      role: "assistant",
      content: welcome,
      content_sanitized: welcome,
      model: updated.claude_model,
      input_tokens: 0,
      output_tokens: 0,
    });
  }

  const { data: ownEntry } = await admin
    .from("project_queue")
    .select("id")
    .eq("project_id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (ownEntry) {
    await removeAndCompact(ownEntry.id);
  }

  return NextResponse.json({ data: updated });
}
