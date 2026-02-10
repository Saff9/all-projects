import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Apex AI | Intelligence for The New Era",
  description: "Built for agents, powered by logic. Experience the next generation of reasoning models.",
  keywords: ["AI", "Artificial Intelligence", "NextJS", "Framer Motion", "Apex AI", "Agentic AI"],
  authors: [{ name: "Apex AI Team" }],
  openGraph: {
    title: "Apex AI | Intelligence for The New Era",
    description: "Built for agents, powered by logic. Experience the next generation of reasoning models.",
    url: "https://apex-ai.com",
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
          <Script
            id="orchids-browser-logs"
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
            strategy="afterInteractive"
            data-orchids-project-id="4826195b-97ce-44ff-b44a-3405243e1343"
          />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="false"
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
