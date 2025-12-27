import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  SITE_NAME,
  SITE_TAGLINE,
  DEFAULT_DESCRIPTION,
  getBaseUrl,
  generateWebsiteSchema,
  generateOrganizationSchema,
} from '@/lib/seo-utils';

const defaultOgImage = `${getBaseUrl()}/api/og?title=Free+Developer+%26+SEO+Tools+Suite&category=21%2B+Instant+Web+Utilities`;

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'free online tools',
    'seo meta tag generator',
    'astro seo generator',
    'website seo audit tool',
    'json validator',
    'wcag contrast checker',
    'url slug generator',
    'developer utilities',
    'regex tester',
    'robots txt generator',
    'schema json ld generator',
    'serp preview tool',
  ],
  authors: [{ name: 'ToolForge Team', url: getBaseUrl() }],
  creator: 'ToolForge',
  publisher: 'ToolForge',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: getBaseUrl(),
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    images: [defaultOgImage],
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
  verification: {
    google: 'Q7mAqyFVwG2zeScg2UAuMLlidBEjgjwhvFngytF5_Ko',
  },
  other: {
    'google-site-verification': 'Q7mAqyFVwG2zeScg2UAuMLlidBEjgjwhvFngytF5_Ko',
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {}),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Search Console Ownership Verification */}
        <meta name="google-site-verification" content="Q7mAqyFVwG2zeScg2UAuMLlidBEjgjwhvFngytF5_Ko" />

        {/* Astro-Grade High-Performance DNS & Resource Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#4f46e5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#070b14" media="(prefers-color-scheme: dark)" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-slate-50 dark:bg-[#070b14] bg-ambient-glow text-slate-900 dark:text-slate-100 transition-colors">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
