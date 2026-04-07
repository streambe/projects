import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  anthropic,
  calculateCost,
  getModelId,
  DEFAULT_MODEL,
} from "@/lib/anthropic/client";
import { buildSystemPrompt } from "@/lib/anthropic/system-prompt";
import { loadContext } from "@/lib/anthropic/context";
import { sanitizeAssistantMessage } from "@/lib/sanitizer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_OUTPUT_TOKENS = 4096;

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
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
  const { data: project } = await admin
    .from("projects")
    .select("id, owner_id")
    .eq("id", id)
    .single();
  if (!project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Anyone authenticated can read; owner/admin can interact.
  const { data: messages, error } = await admin
    .from("project_messages")
    .select(
      "id, role, content, content_sanitized, model, input_tokens, output_tokens, created_at",
    )
    .eq("project_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: messages ?? [] });
}

// ─── POST ────────────────────────────────────────────────────────────────────

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

  const body = (await request.json().catch(() => null)) as {
    content?: string;
  } | null;
  const content = body?.content?.trim();
  if (!content) {
    return NextResponse.json({ error: "empty_content" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: project, error: pErr } = await admin
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (pErr || !project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Check role: admin can always interact, otherwise must be the owner.
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    if (!project.owner_id) {
      return NextResponse.json(
        { error: "not_claimed", message: "Tomá el proyecto antes de chatear." },
        { status: 403 },
      );
    }
    if (project.owner_id !== user.id) {
      return NextResponse.json(
        { error: "forbidden", message: "Este proyecto está tomado por otro usuario." },
        { status: 403 },
      );
    }
  }

  if (project.is_cost_blocked || project.status === "blocked") {
    return NextResponse.json(
      {
        error: "cost_blocked",
        message: `Proyecto bloqueado: se alcanzó el tope de USD ${project.cost_cap_usd.toFixed(2)}.`,
      },
      { status: 402 },
    );
  }

  // Persist the user message and bump last_interaction_at (for auto-release).
  const nowIso = new Date().toISOString();
  const { error: insUserErr } = await admin.from("project_messages").insert({
    project_id: id,
    role: "user",
    content,
    author_user_id: user.id,
  });
  if (insUserErr) {
    return NextResponse.json({ error: insUserErr.message }, { status: 500 });
  }

  await admin
    .from("projects")
    .update({ last_interaction_at: nowIso })
    .eq("id", id);

  // Load sliding window + summary, then append the new user message.
  const { messages: history } = await loadContext(id);
  // loadContext already includes the just-inserted user message since it
  // queries after the insert; dedupe just in case.
  const lastIsUser =
    history.length > 0 &&
    history[history.length - 1]?.role === "user" &&
    history[history.length - 1]?.content === content;
  const messages = lastIsUser ? history : [...history, { role: "user" as const, content }];

  const systemPrompt = buildSystemPrompt({
    name: project.name,
    description: project.description,
    claude_model: project.claude_model,
    context_summary: project.context_summary,
  });

  const modelSlug = project.claude_model || DEFAULT_MODEL;
  const modelId = getModelId(modelSlug);

  // Stream to the client as plain text chunks. Each chunk is just raw text —
  // the client concatenates incrementally.
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = "";
      let tokensIn = 0;
      let tokensOut = 0;

      try {
        const msgStream = anthropic.messages.stream({
          model: modelId,
          max_tokens: MAX_OUTPUT_TOKENS,
          system: systemPrompt,
          messages,
        });

        msgStream.on("text", (delta: string) => {
          fullText += delta;
          controller.enqueue(encoder.encode(delta));
        });

        const final = await msgStream.finalMessage();
        tokensIn = final.usage?.input_tokens ?? 0;
        tokensOut = final.usage?.output_tokens ?? 0;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error desconocido del modelo";
        controller.enqueue(
          encoder.encode(`\n\n[El modelo falló: ${msg}]`),
        );
        controller.close();
        return;
      }

      // Sanitize and persist.
      const { clean, violations } = sanitizeAssistantMessage(fullText);
      if (violations.length > 0) {
        console.warn(
          `[messages:${id}] sanitizer fired: ${violations.join(", ")}`,
        );
      }
      const costUsd = calculateCost(modelSlug, tokensIn, tokensOut);

      const { data: insertedMsg, error: insAsstErr } = await admin
        .from("project_messages")
        .insert({
          project_id: id,
          role: "assistant",
          content: fullText,
          content_sanitized: clean,
          model: modelSlug,
          input_tokens: tokensIn,
          output_tokens: tokensOut,
        })
        .select("id")
        .single();

      if (insAsstErr) {
        console.error("[messages] insert assistant failed", insAsstErr);
      } else {
        const { error: costErr } = await admin.from("project_costs").insert({
          project_id: id,
          message_id: insertedMsg?.id ?? null,
          model: modelSlug,
          input_tokens: tokensIn,
          output_tokens: tokensOut,
          cost_usd: costUsd,
        });
        if (costErr) {
          console.error("[messages] insert cost failed", costErr);
        }
      }

      // Check if the accumulated cost just crossed the cap.
      const { data: after } = await admin
        .from("projects")
        .select("cost_usd, cost_cap_usd, is_cost_blocked, status")
        .eq("id", id)
        .single();
      if (
        after &&
        !after.is_cost_blocked &&
        after.cost_usd >= after.cost_cap_usd
      ) {
        await admin
          .from("projects")
          .update({ is_cost_blocked: true, status: "blocked" })
          .eq("id", id);
        controller.enqueue(
          encoder.encode(
            `\n\n[Tope de USD ${after.cost_cap_usd.toFixed(2)} alcanzado. El proyecto quedó bloqueado.]`,
          ),
        );
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
