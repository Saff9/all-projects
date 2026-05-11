// src/app/api/health/route.ts
// GET /api/health — health check endpoint (used by Vercel monitoring)

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "JEE Hall Finder",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
}
