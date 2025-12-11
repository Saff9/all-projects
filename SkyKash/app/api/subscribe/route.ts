// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let subscribers: Set<string> = new Set();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (subscribers.has(email)) {
      return NextResponse.json(
        { message: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    subscribers.add(email);
    console.log('New subscriber:', email);

    return NextResponse.json(
      { message: 'Email saved successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
