# BudgetTechIndia - Full React & Next.js 14 Architecture Document

## Overview

BudgetTechIndia is an elite, high-performance affiliate technology journalism and deal curation platform dedicated to helping Indian consumers discover the best budget tech products under ₹2,000. Built entirely with **Full React & Next.js 14 App Router**, the architecture delivers instant edge speeds on Vercel, dynamic Neon DB PostgreSQL storage, real-time Amazon product web scraping, and top-tier Google SEO dominance.

---

## 1. Tech Stack Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Native Server-Side Rendering (SSR), Static Generation (SSG), Incremental Static Regeneration (ISR) |
| **Language & UI** | React 18 & TypeScript 5.7 | Pure component-driven, type-safe frontend |
| **Styling** | Tailwind CSS & PostCSS | Cyber-Obsidian & Electric Amber luxury design system |
| **Icons** | Lucide React | Clean, modern vector UI iconography |
| **Database** | Neon DB (Serverless PostgreSQL) | Dynamic product persistence with 7-day TTL auto-purge |
| **API Endpoints** | Next.js Route Handlers | Webhook APIs with password auth & real-time Amazon scraping |
| **SEO & Crawlers** | Metadata API & JSON-LD | Structured Data (`Product`, `AggregateRating`, `Organization`, `WebSite`, `FAQPage`, `BreadcrumbList`) |

---

## 2. Directory Structure

```
site/
├── .env.example
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   ├── site.webmanifest
│   ├── icons/
│   └── images/
└── src/
    ├── app/
    │   ├── layout.tsx                # Global HTML shell & Metadata
    │   ├── page.tsx                  # Home Page (SSR/SSG)
    │   ├── globals.css               # Design tokens & glassmorphism
    │   ├── sitemap.ts                # Dynamic XML Sitemap generator
    │   ├── robots.ts                 # Search crawler rules
    │   ├── llms.txt/route.ts         # AI agent search feed
    │   ├── categories/               # Categories hub & dynamic pages
    │   ├── products/[id]/            # Product detail & benchmark pages
    │   ├── top-5/                    # Ranked comparison guides
    │   ├── reviews/                  # Hands-on editorial reviews
    │   ├── blog/                     # Tech guides & desk setup articles
    │   ├── search/                   # Instant search engine
    │   ├── admin/                    # Admin Dashboard Suite
    │   └── api/webhook/              # Bot Webhook API handlers
    ├── components/
    │   ├── common/ (Header, Footer)
    │   ├── compare/ (CompareContext, CompareDrawer)
    │   ├── home/ (HeroSection, CategoryGrid, FaqSection)
    │   ├── products/ (ProductCard, SpecVisualizer)
    │   └── seo/ (JsonLd)
    ├── data/ (products.json, categories.json)
    └── utils/ (neondb.ts, amazonScraper.ts, amazonAutoAffiliate.ts, webhookAuth.ts)
```

---

## 3. SEO Implementation Strategy

1. **Native Dynamic Metadata**:
   Every route defines `generateMetadata()` computing customized page titles, descriptions, canonical URLs, and OpenGraph/Twitter social cards.

2. **Google Rich Snippet Structured Data**:
   `src/components/seo/JsonLd.tsx` injects schema.org compliant JSON-LD for:
   - `WebSite` & `Organization`
   - `Product` & `Offer` (with price in INR and stock status)
   - `AggregateRating`
   - `BreadcrumbList`
   - `FAQPage`

3. **Dynamic XML Sitemap & Robots.txt**:
   Automatically generated on build and served directly to Googlebot and Bingbot.

---

## 4. Webhook Bot Integration & Scraper

The API endpoint `POST /api/webhook/post` enables automatic product publication:
- **Authentication**: Verified via `WEBHOOK_PASSWORD` header or payload.
- **Auto-Scraper**: Automatically extracts title, image, price, MRP, brand, and category from any Amazon short link or ASIN.
- **Affiliate Tagging**: Automatically formats links with `tag=budgettechpro-21`.
- **7-Day Retention**: Automatically purges expired deals after 7 days.