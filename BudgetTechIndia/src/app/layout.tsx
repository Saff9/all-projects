import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { JsonLd } from '@/components/seo/JsonLd';

export const viewport: Viewport = {
  themeColor: '#07090E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://budget-tech-india.vercel.app'),
  title: {
    default: 'BudgetTechIndia - Best Budget Tech Products Under ₹2000 in India',
    template: '%s | BudgetTechIndia',
  },
  description: 'Your trusted source for honest tech product reviews, comparisons, and buying guides in India. Find the best TWS earbuds, power banks, and smartwatches under ₹2000.',
  keywords: [
    'budget tech india',
    'best earbuds under 1000',
    'best smartwatch under 2000',
    'power banks india',
    'tech gadgets under 500',
    'amazon india deals',
  ],
  authors: [{ name: 'BudgetTechIndia Team', url: 'https://budget-tech-india.vercel.app' }],
  creator: 'BudgetTechIndia',
  publisher: 'BudgetTechIndia',
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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://budget-tech-india.vercel.app',
    siteName: 'BudgetTechIndia',
    title: 'BudgetTechIndia - Best Budget Tech Products Under ₹2000 in India',
    description: 'Honest reviews, curated Amazon deals, and ranked comparisons for budget tech enthusiasts in India.',
    images: [
      {
        url: 'https://budget-tech-india.vercel.app/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'BudgetTechIndia Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BudgetTechIndia - Best Budget Tech Products Under ₹2000',
    description: 'Find verified tech gadget deals, earbuds, power banks, and smartwatches under ₹2,000 in India.',
    creator: '@saff9',
    images: ['https://budget-tech-india.vercel.app/icons/icon-512x512.png'],
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className="dark">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2054366626825410"
          crossOrigin="anonymous"
        />

        {/* 7searchppc Verification Tag */}
        <meta name="7searchppc" content="ee4ee9b623d9361268c6b548b5495882" />

        {/* Ad Scripts (Safely Handled for AdBlockers) */}
        <div id="7SAD15699A62121C900" data-7pub="7SAD15699A62121C900" />
        <script
          async
          src="https://code.adclickppc.com/7s-popunder.js"
          dangerouslySetInnerHTML={{
            __html: `if(typeof initAd==='function'){try{initAd(['7SAD15699A62121C900','popunder'])}catch(e){}}`,
          }}
        />

        <script
          async
          data-cfasync="false"
          src="https://pl28765501.effectivegatecpm.com/0c544f97ca18152424b528f1feff4406/invoke.js"
        />

        <script
          async
          src="https://www.highperformanceformat.com/68f6f7339d5cae7a2b5bf2a4aec60aa9/invoke.js"
        />
      </head>

      <body className="flex flex-col min-h-screen bg-[#07090E] text-[#F8FAFC] antialiased">
        <JsonLd type="website" data={{}} />
        <JsonLd type="organization" data={{}} />

        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
