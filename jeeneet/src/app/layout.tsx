// src/app/layout.tsx
import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";

export const metadata: Metadata = {
  title: "JEE 2026 Session 2 Exam Hall Finder | Find Your NTA Exam Centre",
  description: "Find your JEE Main 2026 Session 2 exam hall, admit card, and exam centre details instantly. Official NTA JEE exam centre locator. Download hall ticket, check exam city, and get all JEE 2026 updates.",
  keywords: [
    "JEE 2026 exam hall",
    "JEE Main 2026 Session 2 admit card",
    "NTA JEE exam centre",
    "JEE hall ticket download",
    "JEE 2026 exam city",
    "jeemain.nta.ac.in hall ticket",
    "JEE Main admit card 2026",
    "JEE exam center locator",
    "JEE Main Session 2 hall finder",
    "NTA JEE city intimation",
    "JEE hall ticket Mumbai Delhi",
    "JEE exam centre list 2026"
  ].join(", "),
  authors: [{ name: "JEE Hall Finder" }],
  openGraph: {
    title: "JEE 2026 Session 2 Exam Hall Finder",
    description: "Instantly find your JEE Main 2026 exam hall and admit card. Check NTA exam centre details.",
    type: "website",
    locale: "en_IN",
    siteName: "JEE Hall Finder",
  },
  twitter: {
    card: "summary_large_image",
    title: "JEE 2026 Session 2 Exam Hall Finder",
    description: "Find your NTA JEE Main 2026 Session 2 exam hall & admit card instantly.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://jee-hall-finder.vercel.app",
    languages: {
      "en-IN": "https://jee-hall-finder.vercel.app",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#003580" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const savedTheme = localStorage.getItem('theme');
              if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.setAttribute('data-theme', 'dark');
              } else {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            })();
          `
        }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "JEE Hall Finder",
              url: "https://jee-hall-finder.vercel.app",
              description: "Find JEE Main 2026 Session 2 exam hall and admit card details",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://jee-hall-finder.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* FAQ Schema — powers Google rich FAQ snippets in search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                { "@type": "Question", name: "When will JEE Main 2026 Session 2 Admit Card release?", acceptedAnswer: { "@type": "Answer", text: "JEE Main 2026 Session 2 Admit Card is expected on jeemain.nta.ac.in approximately 3-5 days before the exam. Check the official NTA portal regularly." } },
                { "@type": "Question", name: "How to download JEE Main 2026 hall ticket?", acceptedAnswer: { "@type": "Answer", text: "Visit jeemain.nta.ac.in, click Admit Card, enter Application Number and Date of Birth, then download and print the hall ticket." } },
                { "@type": "Question", name: "What documents are required at JEE exam hall?", acceptedAnswer: { "@type": "Answer", text: "Carry the printed Admit Card, a valid government photo ID (Aadhar, Passport, Voter ID, PAN, or Driving Licence), and one passport-size photograph." } },
                { "@type": "Question", name: "What time to report at JEE exam centre?", acceptedAnswer: { "@type": "Answer", text: "Report at least 90 minutes before the exam. Entry closes 30 minutes before start time. Check your admit card for specific timing." } },
              ],
            }),
          }}
        />
        {/* BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "JEE Hall Finder",
              url: "https://jee-hall-finder.vercel.app",
              logo: "https://jee-hall-finder.vercel.app/favicon.ico",
              sameAs: ["https://nta.ac.in", "https://jeemain.nta.ac.in"],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                url: "https://jee-hall-finder.vercel.app/#faq"
              }
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://jee-hall-finder.vercel.app" },
                { "@type": "ListItem", position: 2, name: "JEE Main 2026 Session 2 Exam Hall", item: "https://jee-hall-finder.vercel.app/#search" },
              ],
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
