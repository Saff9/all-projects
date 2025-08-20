import { NextRequest, NextResponse } from 'next/server';
import { getAllNeonProducts } from '@/utils/neondb';
import { verifyWebhookPassword } from '@/utils/webhookAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const products = await getAllNeonProducts();
    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let bodyData: any = {};
    try {
      bodyData = await request.json();
    } catch (e) {}

    if (!verifyWebhookPassword(request, bodyData)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing webhook password.' },
        { status: 401 }
      );
    }

    const products = await getAllNeonProducts();
    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
