// src/app/api/news/route.ts
// GET /api/news — returns latest stored JEE news from SQLite

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const { getLatestNews } = await import("@/lib/db");
    const news = getLatestNews(limit);

    return NextResponse.json({ success: true, data: news, count: news.length });
  } catch (err) {
    // Production: Silent fail
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
