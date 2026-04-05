import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { urls } = (await request.json()) as { urls: string[] };
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: "urls array is required" },
        { status: 400 }
      );
    }

    const { data } = await supabaseAdmin
      .from("Lead")
      .select("linkedinUrl")
      .in("linkedinUrl", urls);

    const existing = (data || []).map((row: { linkedinUrl: string }) => row.linkedinUrl);

    return NextResponse.json({ existing });
  } catch (error) {
    console.error("Check existing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
