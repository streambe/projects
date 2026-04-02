import { getServerSession } from "next-auth/next";

export async function getAuthSession() {
  try {
    const { authOptions } = await import("@/lib/auth");
    return getServerSession(authOptions);
  } catch {
    // auth module not ready yet — fallback returns null
    return null;
  }
}

export async function getAuthUserId(): Promise<string | null> {
  const session = await getAuthSession();
  return (session?.user as { id?: string })?.id ?? null;
}
