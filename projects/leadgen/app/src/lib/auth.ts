import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true, email: true, name: true, role: true },
  });

  return { user, dbUser, error: null };
}
