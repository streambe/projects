import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RAPIDAPI_HOST = "fresh-linkedin-profile-data.p.rapidapi.com";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "RAPIDAPI_KEY not configured", code: "MISSING_API_KEY" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("request_id");

    if (!requestId) {
      return NextResponse.json(
        { error: "request_id is required", code: "MISSING_REQUEST_ID" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://${RAPIDAPI_HOST}/get-search-results?request_id=${encodeURIComponent(requestId)}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("RapidAPI get-search-results error:", response.status, text);
      return NextResponse.json(
        { error: "Results fetch failed", code: "RAPIDAPI_ERROR", details: response.status },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("LinkedIn results error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "RESULTS_ERROR" },
      { status: 500 }
    );
  }
}
