import { TOOLS } from '@/lib/tools-data';
import { getBaseUrl, SITE_NAME, SITE_TAGLINE, DEFAULT_DESCRIPTION } from '@/lib/seo-utils';

export async function GET() {
  const baseUrl = getBaseUrl();
  const currentDate = new Date().toUTCString();

  const itemsXml = TOOLS.map((tool) => {
    return `
    <item>
      <title><![CDATA[${tool.name} - Free Online Tool]]></title>
      <link>${baseUrl}/tools/${tool.slug}</link>
      <guid isPermaLink="true">${baseUrl}/tools/${tool.slug}</guid>
      <description><![CDATA[${tool.shortDescription}]]></description>
      <category><![CDATA[${tool.categoryName}]]></category>
      <pubDate>${currentDate}</pubDate>
    </item>`;
  }).join('');

  const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${SITE_NAME} - ${SITE_TAGLINE}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[${DEFAULT_DESCRIPTION}]]></description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(feedXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
