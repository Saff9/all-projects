// src/app/page.tsx
// Server component — fetches news & visitor count server-side

import { cookies } from "next/headers";

// Force dynamic rendering because we use cookies for visitor tracking
export const dynamic = "force-dynamic";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsTicker from "@/components/NewsTicker";
import SearchSection from "@/components/SearchSection";
import NewsSection from "@/components/NewsSection";
import FaqSection from "@/components/FaqSection";
import ImportantLinks from "@/components/ImportantLinks";
import StatsBar from "@/components/StatsBar";

async function getPageData() {
  try {
    const { getDb, getLatestNews, recordVisitor, getUniqueVisitorCount } = await import("@/lib/db");
    const { scrapeAndStoreNews } = await import("@/lib/newsScraper");

    // Initialize DB
    getDb();

    // Scrape news (non-blocking)
    scrapeAndStoreNews().catch(() => {});

    // Visitor tracking via cookie
    const cookieStore = cookies();
    let visitorId = cookieStore.get("vid")?.value;
    if (!visitorId) {
      visitorId = uuidv4();
    }
    recordVisitor(visitorId);

    const news = getLatestNews(12);
    const uniqueVisitors = getUniqueVisitorCount();

    return { news, uniqueVisitors, visitorId };
  } catch (e) {
    console.error("Page data error:", e);
    return { news: [], uniqueVisitors: 0, visitorId: "" };
  }
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JEE Main 2026 Session 2 Hall Finder & Admit Card Download | NTA Official Links",
  description: "Instant JEE Main 2026 Session 2 exam hall finder, admit card download, NTA exam centre locator. Check hall ticket, exam city intimation slip for Session 2. Fast, official NTA portal redirect.",
  keywords: [
    "JEE Main 2026 Session 2 hall ticket",
    "JEE exam hall finder 2026",
    "NTA JEE admit card download",
    "JEE Main Session 2 exam centre",
    "jeemain.nta.ac.in 2026 hall ticket",
    "JEE city intimation slip Session 2",
    "JEE 2026 exam center list",
    "NTA JEE hall finder"
  ].join(", "),
  openGraph: {
    title: "JEE 2026 Session 2 Hall Finder - Admit Card & Exam Centre",
    description: "Find your JEE Main exam hall instantly. Download admit card from NTA portal.",
    images: "/og-image.jpg",
    type: "website",
    locale: "en_IN",
  },
};

export default async function HomePage() {
  const { news, uniqueVisitors } = await getPageData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0f172a] dark:to-[#0a0a0f] relative">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-400/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-400/5 to-pink-400/5 dark:from-orange-400/10 dark:to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/3 to-transparent dark:from-blue-500/8 dark:to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Skip to main content for accessibility */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#003580] text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>
      
      <Header />
      
      <NewsTicker items={news.slice(0, 6) as { title: string; link: string }[]} />
      
      <StatsBar />
      
      <main id="main" className="relative">
        <div className="space-y-0">
          <SearchSection />
          <NewsSection news={news as Parameters<typeof NewsSection>[0]["news"]} />
          <ImportantLinks />
          <FaqSection />
        </div>
      </main>
      
      <Footer uniqueVisitors={uniqueVisitors} />
      
      {/* Loading overlay script for better UX */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Remove loading overlay if exists
            if (document.getElementById('loading-overlay')) {
              document.getElementById('loading-overlay').style.display = 'none';
            }
            
            // Smooth scroll for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
              anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                  target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              });
            });
            
            // Add parallax effect to background elements
            let ticking = false;
            function updateParallax() {
              const scrolled = window.pageYOffset;
              const parallaxElements = document.querySelectorAll('[data-parallax]');
              parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = \`translateY(\${yPos}px)\`;
              });
              ticking = false;
            }
            
            function requestTick() {
              if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
              }
            }
            
            window.addEventListener('scroll', requestTick);
          `
        }}
      />
    </div>
  );
}
