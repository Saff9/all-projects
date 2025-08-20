import { NextRequest, NextResponse } from 'next/server';
import { addNeonProduct } from '@/utils/neondb';
import { verifyWebhookPassword } from '@/utils/webhookAuth';
import { convertToAffiliateUrl, extractAsin } from '@/utils/amazonAutoAffiliate';
import { scrapeAmazonProduct } from '@/utils/amazonScraper';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let bodyData: any = {};
    try {
      bodyData = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    // Verify Password Authentication
    if (!verifyWebhookPassword(request, bodyData)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing webhook password.' },
        { status: 401 }
      );
    }

    const rawUrl = bodyData.url || bodyData.affiliateUrl || bodyData.affiliate_url || bodyData.link;
    const rawAsin = bodyData.asin || (rawUrl ? extractAsin(rawUrl) : null);

    if (!rawUrl && !rawAsin && !bodyData.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: Please provide a valid product URL or ASIN.' },
        { status: 400 }
      );
    }

    // Auto convert or tag link
    let affiliateUrl = rawUrl;
    if (rawUrl) {
      const converted = convertToAffiliateUrl(rawUrl, 'budgettechpro-21');
      if (converted.success && converted.affiliateUrl) {
        affiliateUrl = converted.affiliateUrl;
      }
    } else if (rawAsin) {
      affiliateUrl = `https://www.amazon.in/dp/${rawAsin}?tag=budgettechpro-21`;
    }

    // Automatically scrape real-time Amazon product info if title, price, or image is missing
    let scrapedInfo = null;
    if (!bodyData.name || !bodyData.price || !bodyData.imageUrl) {
      scrapedInfo = await scrapeAmazonProduct(rawUrl || affiliateUrl);
    }

    const asinClean = rawAsin || (scrapedInfo ? scrapedInfo.asin : 'PROD' + Date.now().toString().slice(-6));
    const name = bodyData.name || (scrapedInfo ? scrapedInfo.name : `Featured Deal (${asinClean})`);
    const category = bodyData.category || (scrapedInfo ? scrapedInfo.category : 'budget-gadgets-under-999');
    const price = bodyData.price !== undefined ? Number(bodyData.price) : (scrapedInfo ? scrapedInfo.price : 999);
    const mrp = bodyData.mrp ? Number(bodyData.mrp) : (scrapedInfo ? scrapedInfo.mrp : Math.round(price * 1.4));
    const brand = bodyData.brand || (scrapedInfo ? scrapedInfo.brand : 'Featured Brand');
    const imageUrl = bodyData.imageUrl || bodyData.image_url || (scrapedInfo ? scrapedInfo.imageUrl : '/images/placeholder-product.svg');
    const description = bodyData.description || (scrapedInfo ? scrapedInfo.description : `Special deal: ${name} on Amazon India.`);

    const retentionDays = typeof bodyData.expiryDays === 'number' ? bodyData.expiryDays : 7;

    const product = await addNeonProduct(
      {
        id: bodyData.id || `prod_${asinClean.toLowerCase()}`,
        slug: bodyData.slug || `deal-${asinClean.toLowerCase()}`,
        name,
        category,
        price,
        mrp,
        affiliateUrl,
        imageUrl,
        brand,
        description,
        rating: bodyData.rating ? Number(bodyData.rating) : 4.5,
        inStock: bodyData.inStock !== false,
        isActive: bodyData.isActive !== false,
        features: bodyData.features || {},
      },
      retentionDays
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Failed to insert product into Neon DB' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Product deal posted and scraped successfully. Auto-expiring in ${retentionDays} days.`,
        product,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Next.js Webhook POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
