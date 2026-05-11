// src/app/api/visitors/route.ts
// POST /api/visitors — records a unique visitor via cookie-based ID
// GET  /api/visitors — returns total unique visitor count

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { getUniqueVisitorCount } = await import("@/lib/db");
    const count = getUniqueVisitorCount();
    return NextResponse.json({ success: true, uniqueVisitors: count });
  } catch (err) {
    // Production: Silent fail
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { recordVisitor } = await import("@/lib/db");

    // Get or create visitor ID from cookie
    let visitorId = req.cookies.get("vid")?.value;
    const isNew = !visitorId;
    if (!visitorId) visitorId = uuidv4();

    recordVisitor(visitorId);

    const res = NextResponse.json({ success: true, isNew });
    if (isNew) {
      res.cookies.set("vid", visitorId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return res;
  } catch (err) {
    // Production: Silent fail
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
