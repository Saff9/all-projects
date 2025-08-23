/**
 * Amazon Auto-Affiliate Link Generator & Transformer
 * Automatically extracts ASIN or short code from any raw Amazon link or short link
 * (e.g., https://link.amazon/B07Gv2TSA, link.amazon/B01NI5GXB, amzn.to/..., amazon.in/dp/...)
 * and generates tagged affiliate URLs using budgettechpro-21.
 */

export interface AmazonAffiliateResult {
  success: boolean;
  asin?: string;
  affiliateUrl?: string;
  error?: string;
}

/**
 * Get active Amazon Associate Tag from environment or fallback
 */
export function getAmazonTag(): string {
  if (typeof process !== 'undefined' && (process.env.AMAZON_AFFILIATE_TAG || process.env.PUBLIC_AMAZON_AFFILIATE_TAG)) {
    return process.env.AMAZON_AFFILIATE_TAG || process.env.PUBLIC_AMAZON_AFFILIATE_TAG || 'budgettechpro-21';
  }
  return 'budgettechpro-21';
}

/**
 * Extract ASIN or short code (6-12 alphanumeric characters) from any Amazon link:
 * - https://link.amazon/B07Gv2TSA
 * - https://link.amazon/B01NI5GXB
 * - https://www.amazon.in/dp/B0B5L21SGR
 * - https://amzn.in/d/B07H5R1L1X
 * - B07BCH6JQK
 */
export function extractAsin(input: string): string | null {
  if (!input) return null;
  const cleanInput = input.trim();

  // If input is already just a 6 to 12-character ASIN/code
  if (/^[A-Z0-9]{6,12}$/i.test(cleanInput)) {
    return cleanInput.toUpperCase();
  }

  // 1. Direct Regex for link.amazon/CODE or amzn.in/d/CODE or /dp/ASIN or /gp/product/ASIN
  const directAsinMatch = cleanInput.match(/(?:link\.amazon\/|amzn\.in\/d\/|amzn\.to\/|\/dp\/|\/gp\/product\/|\/product\/)([A-Z0-9]{6,12})/i);
  if (directAsinMatch && directAsinMatch[1]) {
    return directAsinMatch[1].toUpperCase();
  }

  // 2. Generic URL path extraction
  try {
    const url = new URL(cleanInput);

    const patterns = [
      /\/dp\/([A-Z0-9]{6,12})/i,
      /\/gp\/product\/([A-Z0-9]{6,12})/i,
      /\/product\/([A-Z0-9]{6,12})/i,
      /\/d\/([A-Z0-9]{6,12})/i,
      /\/([A-Z0-9]{6,12})(?:\/|\?|$)/i,
    ];

    for (const pattern of patterns) {
      const match = url.pathname.match(pattern);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }

    const queryAsin = url.searchParams.get('asin') || url.searchParams.get('ASIN');
    if (queryAsin && /^[A-Z0-9]{6,12}$/i.test(queryAsin)) {
      return queryAsin.toUpperCase();
    }
  } catch (e) {
    const fallbackMatch = cleanInput.match(/([A-Z0-9]{6,12})/i);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Format any Amazon input into a tagged affiliate URL
 */
export function convertToAffiliateUrl(rawInput: string, customTag?: string): AmazonAffiliateResult {
  if (!rawInput) {
    return { success: false, error: 'Empty URL provided' };
  }

  const cleanInput = rawInput.trim();
  const tag = customTag || getAmazonTag();

  // If input is a short link like https://link.amazon/B07Gv2TSA
  if (cleanInput.includes('link.amazon/') || cleanInput.includes('amzn.to/')) {
    if (cleanInput.includes('tag=')) {
      return { success: true, affiliateUrl: cleanInput };
    }
    const urlWithTag = cleanInput.includes('?') ? `${cleanInput}&tag=${tag}` : `${cleanInput}?tag=${tag}`;
    return { success: true, affiliateUrl: urlWithTag };
  }

  const asin = extractAsin(cleanInput);
  if (asin) {
    const affiliateUrl = `https://www.amazon.in/dp/${asin}?tag=${tag}`;
    return {
      success: true,
      asin,
      affiliateUrl,
    };
  }

  if (cleanInput.startsWith('http')) {
    try {
      const urlObj = new URL(cleanInput);
      if (!urlObj.searchParams.has('tag')) {
        urlObj.searchParams.set('tag', tag);
      }
      return {
        success: true,
        affiliateUrl: urlObj.toString(),
      };
    } catch (e) {
      return { success: true, affiliateUrl: `${cleanInput}?tag=${tag}` };
    }
  }

  return {
    success: false,
    error: 'Could not parse Amazon URL or ASIN',
  };
}
