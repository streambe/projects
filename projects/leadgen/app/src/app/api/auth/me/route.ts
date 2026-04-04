import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json(
      { error: "User not found in database", code: "USER_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: dbUser });
}
