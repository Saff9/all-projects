import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { FavoritesProvider, ThemeProvider } from "@/context/FavoritesContext";

// Security headers configuration
export const headers = () => [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()' },
  { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
];

// Generate static params for all tool pages
export function generateStaticParams() {
  const { tools } = require('@/utils/tools');
  return tools.map((tool: { id: string }) => ({ id: tool.id }));
}

export const metadata: Metadata = {
  title: "DevKit - 50+ Free Developer Tools | JSON Formatter, JWT Decoder, Regex Tester",
  description: "DevKit is a collection of 50+ free, privacy-focused developer tools. Format JSON, decode JWTs, test regex, generate passwords, convert colors, and more. 100% client-side, no data leaves your browser.",
  keywords: "developer tools, json formatter, jwt decoder, regex tester, base64 encoder, url encoder, password generator, uuid generator, hash generator, color picker, gradient generator, markdown preview, diff checker, timestamp converter, web developer tools, programming tools, code formatter",
  authors: [{ name: "DevKit" }],
  creator: "DevKit",
  publisher: "DevKit",
  robots: "index, follow",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devkit-peach.vercel.app",
    siteName: "DevKit",
    title: "DevKit - 50+ Free Developer Tools",
    description: "Free, privacy-focused developer tools. JSON formatter, JWT decoder, regex tester, password generator & more. 100% client-side.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevKit - 50+ Free Developer Tools",
    description: "Free, privacy-focused developer tools. 100% client-side, no data leaves your browser.",
    creator: "@devkit",
  },
  category: "Developer Tools",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DevKit" />
        <meta name="application-name" content="DevKit" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "DevKit",
              description: "Free developer tools collection - JSON formatter, JWT decoder, regex tester, and more.",
              url: "https://devkit-peach.vercel.app",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "JSON Formatter and Validator",
                "JWT Decoder",
                "Base64 Encoder/Decoder",
                "URL Encoder/Decoder",
                "Regex Tester",
                "Password Generator",
                "UUID Generator",
                "Hash Generator",
                "Color Picker",
                "Gradient Generator",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white antialiased gpu-accelerated will-change-transform">
        <ThemeProvider>
          <FavoritesProvider>
            <div className="relative z-10">
              <Header />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
            </div>
          </FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
