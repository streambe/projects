import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Verifies the Supabase session and returns the authenticated user.
 * Returns a 401 NextResponse if not authenticated.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      dbUser: null,
      error: NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  const { data: dbUser } = await supabaseAdmin
    .from("User")
    .select("id, email, name, role")
    .eq("email", user.email!)
    .single();

  return { user, dbUser, error: null };
}
