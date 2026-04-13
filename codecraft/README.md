# Code Craft

A developer blog & open‑source project showcase, built with Next.js.

## Features
- Blog & project pages (MDX)
- Beautiful card UI with custom colour palette
- Social sharing (Twitter, Facebook, LinkedIn, WhatsApp, Reddit, HN, Copy)
- Newsletter with email validation & MX check (stored in Vercel KV)
- Admin page to view subscribers
- Terminal easter egg (press `~`)
- Reading streak, bookmarks, audio reader
- Live code playgrounds (StackBlitz)
- Random article button
- Personalised "For You" feed
- GitHub stats on project pages
- Tags, search (Fuse.js), RSS, llms.txt, sitemap
- Fully responsive, dark mode

## Getting Started
1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the required values.
4. Run `npm run dev` → http://localhost:3000.

## Adding Content
- Blog posts: create `.mdx` files in `content/blog`.
- Project pages: create `.mdx` files in `content/projects`.
Each file must contain frontmatter (title, description, date, tags, etc.). See the example files.

## Deployment
- Push to GitHub.
- Import the project on Vercel.
- Add the environment variables from `.env.example` to your Vercel project settings.
- Deploy!
