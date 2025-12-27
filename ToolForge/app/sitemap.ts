import { MetadataRoute } from 'next';
import { TOOLS, CATEGORIES } from '@/lib/tools-data';
import { getBaseUrl } from '@/lib/seo-utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const currentDate = new Date().toISOString();

  // 1. Homepage
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1.0,
  };

  // 2. Category Hub Pages
  const categoryEntries: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 3. 20+ Tool Pages
  const toolEntries: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 4. Legal / Info Pages
  const legalEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  return [homeEntry, ...categoryEntries, ...toolEntries, ...legalEntries];
}
