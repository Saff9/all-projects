# 🎓 JEE Hall Finder — JEE Main 2026 Session 2

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live-success?style=flat-square)
![SEO](https://img.shields.io/badge/SEO-Optimised-blue?style=flat-square)

**Find your JEE Main 2026 Session 2 exam hall, admit card, and exam centre — fast.**

[🌐 Live Demo](https://jee-hall-finder.vercel.app) · [🐛 Report Bug](https://github.com/your-username/jee-hall-finder/issues) · [✨ Request Feature](https://github.com/your-username/jee-hall-finder/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment (Vercel)](#-deployment-vercel)
- [SEO Strategy](#-seo-strategy)
- [Contributing](#-contributing)
- [Disclaimer](#-disclaimer)

---

## 🏫 About

**JEE Hall Finder** is a fast, SEO-optimised web portal that helps JEE Main 2026 Session 2 candidates:

- Quickly locate their **exam hall / exam centre**
- **Download admit card** via the official NTA portal
- Stay updated with **live JEE news** scraped from trusted RSS feeds (NDTV, The Hindu, TOI)
- Read **FAQs** about exam day rules, documents, and timings

Built to look professional like the NTA website — clean, trustworthy, and fully mobile-responsive.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔍 **Exam Hall Search** | App number + DOB → redirects to official NTA portal |
| 📰 **Live News Feed** | Auto-scrapes JEE news from RSS feeds every hour |
| 🗃️ **SQLite Storage** | News persisted in local SQLite DB via `better-sqlite3` |
| 👥 **Visitor Counter** | Unique visitor count tracked via cookie + DB, shown in footer |
| 📡 **News Ticker** | Scrolling live news ticker at the top |
| ❓ **FAQ Section** | Accordion FAQ covering all common JEE exam day queries |
| 🔗 **Important Links** | Direct links to NTA, Shiksha, NDTV, Careers360 |
| 🤖 **robots.txt** | Auto-generated, crawler-friendly |
| 🗺️ **sitemap.xml** | Dynamic XML sitemap submitted to Google Search Console |
| 📱 **Mobile Responsive** | Fully functional on all screen sizes |
| ⚡ **Vercel Ready** | One-click deploy with cron job for auto-news scraping |
| 🔒 **Secure Headers** | X-Frame-Options, X-Content-Type-Options, XSS Protection |
| 🧱 **404 & Error Pages** | Custom not-found and error boundaries |
| ⏳ **Loading Skeleton** | Smooth skeleton loader while server data fetches |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **Database** | SQLite via `better-sqlite3` |
| **News Scraping** | `rss-parser` (NDTV, The Hindu, TOI RSS feeds) |
| **Fonts** | Google Fonts — Mukta (headings) + Noto Sans (body) |
| **Deployment** | Vercel (Region: bom1 — Mumbai) |
| **Cron Jobs** | Vercel Cron (hourly news scraping) |
| **SEO** | Next.js Metadata API, sitemap.ts, robots.ts, JSON-LD schema |

---

## 📁 Folder Structure

```
jee-hall-finder/
├── public/                          # Static assets
│   └── favicon.ico
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout + SEO metadata + JSON-LD
│   │   ├── page.tsx                 # Homepage (Server Component)
│   │   ├── loading.tsx              # Loading skeleton
│   │   ├── error.tsx                # Global error boundary
│   │   ├── not-found.tsx            # Custom 404 page
│   │   ├── sitemap.ts               # Dynamic /sitemap.xml generation
│   │   ├── robots.ts                # Dynamic /robots.txt generation
│   │   │
│   │   └── api/                     # API Routes
│   │       ├── news/
│   │       │   ├── route.ts         # GET  /api/news — fetch news from DB
│   │       │   └── scrape/
│   │       │       └── route.ts     # POST /api/news/scrape — trigger scraper
│   │       ├── visitors/
│   │       │   └── route.ts         # GET/POST /api/visitors — visitor tracking
│   │       └── health/
│   │           └── route.ts         # GET /api/health — health check
│   │
│   ├── components/                  # Reusable UI Components
│   │   ├── Header.tsx               # Top navigation bar
│   │   ├── Footer.tsx               # Footer with unique visitor counter
│   │   ├── NewsTicker.tsx           # Scrolling live news ticker
│   │   ├── StatsBar.tsx             # Key statistics bar (aspirants, cities, etc.)
│   │   ├── SearchSection.tsx        # Main hall finder search form
│   │   ├── NewsSection.tsx          # News grid cards
│   │   ├── FaqSection.tsx           # Accordion FAQ section
│   │   └── ImportantLinks.tsx       # Quick links to NTA, Shiksha, NDTV
│   │
│   ├── lib/                         # Server-side utilities
│   │   ├── db.ts                    # SQLite init, helpers (news, visitors)
│   │   └── newsScraper.ts           # RSS feed scraper + JEE keyword filter
│   │
│   ├── middleware.ts                 # Cookie-based visitor ID injection
│   │
│   └── styles/
│       └── globals.css              # Tailwind base + custom NTA theme CSS
│
├── data/                            # SQLite DB files (gitignored)
│   └── jee.db                       # Auto-created on first run
│
├── .env.example                     # Environment variable template
├── .env.local                       # Your local env (never commit!)
├── .gitignore
├── .eslintrc.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vercel.json                      # Vercel deploy config + cron jobs
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18+**
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/jee-hall-finder.git
cd jee-hall-finder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CRON_SECRET=any-random-secret-string
DB_PATH=data/jee.db
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Trigger News Scraping (First Time)

```bash
curl -X POST http://localhost:3000/api/news/scrape \
  -H "Content-Type: application/json" \
  -d '{"secret":"any-random-secret-string"}'
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | ✅ | Your deployed site URL (no trailing slash) |
| `CRON_SECRET` | ✅ | Secret to protect the `/api/news/scrape` endpoint |
| `DB_PATH` | ❌ | SQLite file path (default: `data/jee.db`) |

> ⚠️ On Vercel, SQLite writes to `/tmp/jee.db` (ephemeral). For persistent storage, upgrade to [Turso](https://turso.tech/) or [PlanetScale](https://planetscale.com/).

---

## 📡 API Reference

### `GET /api/news`
Returns latest stored JEE news from SQLite.

**Query params:**
- `limit` — number of results (max 50, default 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "JEE Main 2026 Admit Card Released",
      "link": "https://...",
      "description": "...",
      "source": "NDTV Education",
      "pub_date": "2026-03-29T08:00:00Z",
      "fetched_at": "2026-03-29 10:00:00"
    }
  ],
  "count": 12
}
```

---

### `POST /api/news/scrape`
Triggers live RSS scraping and saves results to DB.

**Body:**
```json
{ "secret": "your-cron-secret" }
```

**Response:**
```json
{ "success": true, "itemsSaved": 7 }
```

---

### `GET /api/visitors`
Returns total unique visitor count.

**Response:**
```json
{ "success": true, "uniqueVisitors": 1482 }
```

---

### `POST /api/visitors`
Records a visit (sets cookie if new visitor).

**Response:**
```json
{ "success": true, "isNew": true }
```

---

### `GET /api/health`
Health check for uptime monitoring.

**Response:**
```json
{ "status": "ok", "service": "JEE Hall Finder", "timestamp": "..." }
```

---

## 🚢 Deployment (Vercel)

### Step-by-step

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "feat: initial JEE Hall Finder"
git remote add origin https://github.com/your-username/jee-hall-finder.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repo
   - Framework: **Next.js** (auto-detected)

3. **Add Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_BASE_URL` → `https://your-domain.vercel.app`
   - `CRON_SECRET` → your secret key

4. **Deploy** — Vercel auto-deploys on every `git push`

5. **Cron Job** — `vercel.json` sets up hourly scraping at `0 * * * *` automatically

### Submit to Google Search Console

After deploying:
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your domain
3. Submit `https://your-domain.vercel.app/sitemap.xml`

---

## 🔍 SEO Strategy

| Technique | Implementation |
|---|---|
| **Meta tags** | Title, description, keywords in `layout.tsx` |
| **Open Graph** | Full OG tags for social sharing |
| **Twitter Card** | Summary large image card |
| **JSON-LD Schema** | WebSite + SearchAction structured data |
| **sitemap.xml** | Dynamic, auto-generated via `sitemap.ts` |
| **robots.txt** | Auto-generated, allows all crawlers |
| **Canonical URL** | Set in metadata to avoid duplicate content |
| **Mobile-first** | Fully responsive — Google mobile-first indexing |
| **Fast load** | Next.js SSR + ISR + optimised fonts |
| **Keyword targeting** | "JEE 2026 exam hall", "NTA admit card", etc. |

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork → Clone → Branch
git checkout -b feature/your-feature

# Make changes, then
git commit -m "feat: describe your change"
git push origin feature/your-feature

# Open a Pull Request
```

---

## ⚠️ Disclaimer

This is an **unofficial** helper portal and is **not affiliated with NTA** (National Testing Agency). All official exam information, admit cards, and results must be verified from:

- 🏛️ [nta.ac.in](https://nta.ac.in)
- 🎓 [jeemain.nta.ac.in](https://jeemain.nta.ac.in)

We do not store any candidate personal data.

---

<div align="center">

Made with ❤️ for JEE 2026 Aspirants

⭐ Star this repo if it helped you!

</div>
