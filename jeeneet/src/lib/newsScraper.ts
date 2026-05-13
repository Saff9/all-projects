// src/lib/newsScraper.ts
// Scrapes live JEE-related news from RSS feeds and stores in SQLite

import { saveNewsItems } from "./db";

const JEE_FEEDS = [
  {
    url: "https://www.ndtv.com/rss/education",
    source: "NDTV Education",
  },
  {
    url: "https://www.thehindu.com/education/feed/",
    source: "The Hindu Education",
  },
  {
    url: "https://timesofindia.indiatimes.com/rssfeeds/913168846.cms",
    source: "Times of India Education",
  },
];

const JEE_KEYWORDS = ["jee", "nta", "joint entrance", "admit card", "hall ticket", "jeemain"];

function isJeeRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return JEE_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function scrapeAndStoreNews(): Promise<number> {
  try {
    // Dynamic import for RSS parser
    const Parser = (await import("rss-parser")).default;
    const parser = new Parser({
      timeout: 10000,
      headers: { "User-Agent": "JEEHallFinder/1.0" },
    });

    const allItems: {
      title: string;
      link: string;
      description?: string;
      source?: string;
      pub_date?: string;
    }[] = [];

    for (const feed of JEE_FEEDS) {
      try {
        const result = await parser.parseURL(feed.url);
        for (const item of result.items || []) {
          const combined = `${item.title || ""} ${item.contentSnippet || ""}`;
          if (isJeeRelated(combined)) {
            allItems.push({
              title: item.title?.slice(0, 500) || "No title",
              link: item.link || "",
              description: item.contentSnippet?.slice(0, 1000) || "",
              source: feed.source,
              pub_date: item.pubDate || new Date().toISOString(),
            });
          }
        }
      } catch (feedErr) {
        console.warn(`Failed to fetch feed: ${feed.url}`, feedErr);
      }
    }

    if (allItems.length > 0) saveNewsItems(allItems);
    return allItems.length;
  } catch (err) {
    console.error("scrapeAndStoreNews error:", err);
    return 0;
  }
}
