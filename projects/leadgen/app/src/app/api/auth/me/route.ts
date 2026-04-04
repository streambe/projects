import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Not authenticated", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { data: dbUser, error } = await supabaseAdmin
    .from("User")
    .select("id, email, name, role, avatarUrl")
    .eq("email", user.email!)
    .single();

  if (error || !dbUser) {
    return NextResponse.json(
      { error: "User not found in database", code: "USER_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: dbUser });
}
