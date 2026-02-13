import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import FloatingCTA from "@/components/FloatingCTA";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: "Apex AI | Intelligence for The New Era",
  description: "Built for agents, powered by logic. Experience the next generation of reasoning models.",
  keywords: ["AI", "Artificial Intelligence", "NextJS", "Framer Motion", "Apex AI", "Agentic AI"],
  authors: [{ name: "Apex AI Team" }],
  openGraph: {
    title: "Apex AI | Intelligence for The New Era",
    description: "Built for agents, powered by logic. Experience the next generation of reasoning models.",
    siteName: "Apex AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Apex AI Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex AI | Intelligence for The New Era",
    description: "Built for agents, powered by logic. Experience the next generation of reasoning models.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable}`}>
      <body className="antialiased font-sans bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >

          <BackgroundAnimation />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <FloatingCTA />
        </ThemeProvider>
      </body>
    </html>
  );
}
