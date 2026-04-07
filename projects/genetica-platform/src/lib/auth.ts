import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type AppUser = Tables<"users">;

/**
 * Returns the current authenticated user (auth + public.users row).
 * If no session exists, redirects to /login.
 */
export async function requireUser(): Promise<{
  authId: string;
  email: string;
  profile: AppUser;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Auth row exists but no profile — force logout.
    await supabase.auth.signOut();
    redirect("/login");
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=inactive");
  }

  return {
    authId: user.id,
    email: user.email ?? profile.email,
    profile,
  };
}

/**
 * Like requireUser but additionally requires admin role.
 * Redirects to /dashboard if not admin.
 */
export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }
  return session;
}

/**
 * Returns the current user or null without redirecting. Useful for /login page.
 */
export async function getOptionalUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
