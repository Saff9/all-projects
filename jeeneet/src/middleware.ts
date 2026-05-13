// src/middleware.ts
// Sets visitor cookie on first visit for unique visitor tracking

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Only apply to page routes, not API or static
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return res;
  }

  // Set visitor ID cookie if not present
  if (!req.cookies.get("vid")) {
    const visitorId = uuidv4();
    res.cookies.set("vid", visitorId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
