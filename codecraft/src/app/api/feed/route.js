// src/app/api/feed/route.js
import { getAllPosts } from '@/lib/posts';

export const runtime = 'nodejs';

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  const posts = getAllPosts('blog').slice(0, 20);
  const items = posts
    .map(
      p => `
      <item>
        <title>${escapeXml(p.frontmatter.title)}</title>
        <link>https://codecraft.vercel.app/blog/${p.slug}</link>
        <description>${escapeXml(p.frontmatter.description || '')}</description>
        <pubDate>${new Date(p.frontmatter.date).toUTCString()}</pubDate>
      </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Code Craft</title>
        <link>https://codecraft.vercel.app</link>
        <description>Developer articles and open‑source projects</description>
        <language>en</language>
        <atom:link href="https://codecraft.vercel.app/feed.xml" rel="self" type="application/rss+xml"/>
        ${items}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
