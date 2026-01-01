import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TypeFlow - Professional Typing Speed Test",
  description: "Test your typing speed and accuracy with TypeFlow. A professional, modern typing test application with real-time statistics, multiple test modes, and detailed performance analytics.",
  keywords: [
    "typing test",
    "typing speed",
    "WPM test",
    "typing accuracy",
    "keyboarding",
    "touch typing",
    "typing practice",
    "professional typing",
  ],
  authors: [{ name: "TypeFlow" }],
  openGraph: {
    title: "TypeFlow - Professional Typing Speed Test",
    description: "Test your typing speed and accuracy with TypeFlow. A professional, modern typing test application.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TypeFlow - Professional Typing Speed Test",
    description: "Test your typing speed and accuracy with TypeFlow.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { headers } from 'next/headers';
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}