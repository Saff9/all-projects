import { NextRequest, NextResponse } from 'next/server';
import { deleteNeonProduct, purgeExpiredProducts } from '@/utils/neondb';
import { verifyWebhookPassword } from '@/utils/webhookAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let bodyData: any = {};
    try {
      bodyData = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!verifyWebhookPassword(request, bodyData)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing webhook password.' },
        { status: 401 }
      );
    }

    if (bodyData.action === 'purge' || bodyData.action === 'clean') {
      const deletedCount = await purgeExpiredProducts();
      return NextResponse.json({
        success: true,
        message: `Purged ${deletedCount} expired products.`,
        deletedCount,
      });
    }

    const id = bodyData.id || bodyData.productId || bodyData.asin;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: id or asin' },
        { status: 400 }
      );
    }

    const deleted = await deleteNeonProduct(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Product not found or failed to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
