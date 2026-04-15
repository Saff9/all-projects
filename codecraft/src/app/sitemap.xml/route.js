// src/app/sitemap.xml/route.js
import { getAllPosts } from '@/lib/posts';

export const runtime = 'nodejs';

export async function GET() {
  const baseUrl = 'https://codecraft.vercel.app';
  const blog = getAllPosts('blog');
  const projects = getAllPosts('projects');

  const staticPages = [
    { url: `${baseUrl}/`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/blog`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/projects`, lastmod: new Date().toISOString() },
    { url: `${baseUrl}/roadmap`, lastmod: new Date().toISOString() },
  ];

  const blogUrls = blog.map(p => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastmod: p.frontmatter.date || new Date().toISOString(),
  }));

  const projectUrls = projects.map(p => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastmod: p.frontmatter.date || new Date().toISOString(),
  }));

  const allUrls = [...staticPages, ...blogUrls, ...projectUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allUrls
        .map(
          u => `
        <url>
          <loc>${u.url}</loc>
          <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>`
        )
        .join('')}
    </urlset>`;

  return new Response(sitemap, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
