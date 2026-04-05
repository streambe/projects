import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Auth check
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
        {
          error: "RAPIDAPI_KEY not configured",
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");
    const geo_code = searchParams.get("geo_code") || "";
    const page = searchParams.get("page") || "1";

    if (!keyword) {
      return NextResponse.json(
        { error: "keyword is required", code: "MISSING_KEYWORD" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({ keyword, page });
    if (geo_code) {
      params.set("geo_code", geo_code);
    }

    const response = await fetch(
      `https://fresh-linkedin-profile-data.p.rapidapi.com/search-people?${params.toString()}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "fresh-linkedin-profile-data.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("RapidAPI error:", response.status, text);
      return NextResponse.json(
        {
          error: "LinkedIn search failed",
          code: "RAPIDAPI_ERROR",
          details: response.status,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("LinkedIn search error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "SEARCH_ERROR" },
      { status: 500 }
    );
  }
}
