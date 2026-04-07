import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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
    new_cap_usd?: number;
  } | null;
  const newCap = Number(body?.new_cap_usd);
  if (!Number.isFinite(newCap) || newCap <= 0) {
    return NextResponse.json({ error: "invalid_cap" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id, owner_id, cost_usd, cost_cap_usd")
    .eq("id", id)
    .single();
  if (!project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (project.owner_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (newCap <= project.cost_usd) {
    return NextResponse.json(
      { error: "cap_below_current_cost" },
      { status: 400 },
    );
  }

  const { data: updated, error } = await admin
    .from("projects")
    .update({
      cost_cap_usd: newCap,
      is_cost_blocked: false,
      status: "owned",
      cost_override_approved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: updated });
}
