// src/app/robots.txt/route.js
export const runtime = 'nodejs';

export async function GET() {
  const robots = `User-agent: *
Allow: /

Sitemap: https://codecraft.vercel.app/sitemap.xml
`;
  return new Response(robots, { headers: { 'Content-Type': 'text/plain' } });
}
