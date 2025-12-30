import type { Metadata } from 'next';
import { ToolItem } from './tools-data';

export const SITE_NAME = 'ToolForge';
export const SITE_TAGLINE = 'Free Online Web Utilities, SEO & Developer Suite';
export const GITHUB_REPO_URL = 'https://github.com/saff9/ToolForge';
export const DEFAULT_DESCRIPTION =
  'Supercharge your workflow with 21+ free, client-side web utilities, SEO analyzers, JSON formatters, WCAG contrast checkers, and CSS generators. 100% private, instant, and ad-light.';

export const CANONICAL_DOMAIN = 'https://toolforge-dusky.vercel.app';
export const RAZORPAY_DONATE_URL = 'https://razorpay.me/@CodeChap';
export const CRYPTO_DONATE_ADDRESS = 'DfL2H7rAaocxpyNYdefV7aybNCSBVJiUSGAn3RDFKRb7';

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  return CANONICAL_DOMAIN;
}

export function generateCanonicalUrl(path: string): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function generateToolMetadata(tool: ToolItem): Metadata {
  const canonical = generateCanonicalUrl(`/tools/${tool.slug}`);
  const title = `${tool.name} - Free Online Tool | ${SITE_NAME}`;
  const description = `${tool.shortDescription} 100% free, private, browser-based tool with zero installation.`;

  // Multilingual international keyword expansion (as per international SEO blueprint)
  const internationalKeywords = [
    tool.primaryKeyword,
    ...tool.secondaryKeywords,
    `online ${tool.slug.replace(/-/g, ' ')}`,
    `free ${tool.slug.replace(/-/g, ' ')} tool`,
    `ferramenta ${tool.slug.replace(/-/g, ' ')} gratis`, // Portuguese (Brazil)
    `herramienta ${tool.slug.replace(/-/g, ' ')} gratis`, // Spanish (LatAm/Spain)
    `outil ${tool.slug.replace(/-/g, ' ')} gratuit`, // French
    `kostenlos ${tool.slug.replace(/-/g, ' ')} online`, // German
  ];

  const ogImageUrl = `${getBaseUrl()}/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(tool.categoryName)}`;

  return {
    title,
    description,
    keywords: internationalKeywords,
    alternates: {
      canonical,
      languages: {
        'en-US': canonical,
        'pt-BR': `${canonical}?lang=pt`,
        'es-ES': `${canonical}?lang=es`,
        'fr-FR': `${canonical}?lang=fr`,
        'de-DE': `${canonical}?lang=de`,
        'x-default': canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// ==========================================
// SCHEMA.ORG JSON-LD GENERATORS
// ==========================================

export function generateWebApplicationSchema(tool: ToolItem) {
  const url = generateCanonicalUrl(`/tools/${tool.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: url,
    description: tool.shortDescription,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: tool.features.join(', '),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : generateCanonicalUrl(item.url),
    })),
  };
}

export function generateWebsiteSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: baseUrl,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
  };
}
