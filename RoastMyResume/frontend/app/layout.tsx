import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: "swap"
});

export const metadata: Metadata = {
  title: "RoastMyResume - AI-Powered Resume Roasting",
  description: "Get brutally funny, ego-bruising resume roasts that secretly give real career advice. Share your roast with the world!",
  keywords: ["resume", "career", "AI", "roast", "job search", "ATS"],
  authors: [{ name: "RoastMyResume" }],
  openGraph: {
    title: "RoastMyResume",
    description: "Your resume is about to get destroyed (lovingly)",
    type: "website",
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
