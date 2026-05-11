// src/app/api/news/scrape/route.ts
// POST /api/news/scrape — triggers live news scraping and stores to SQLite

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Simple secret guard so random people can't spam it
    const { secret } = await req.json().catch(() => ({ secret: "" }));
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scrapeAndStoreNews } = await import("@/lib/newsScraper");
    const count = await scrapeAndStoreNews();

    return NextResponse.json({ success: true, itemsSaved: count });
  } catch (err) {
    // Production: Silent fail
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
