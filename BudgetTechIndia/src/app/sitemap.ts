import { MetadataRoute } from 'next';
import { getAllNeonProducts } from '@/utils/neondb';
import productsData from '@/data/products.json';

const BASE_URL = 'https://budget-tech-india.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/categories',
    '/categories/bluetooth-earbuds',
    '/categories/power-banks',
    '/categories/smartwatches',
    '/categories/fast-chargers-cables',
    '/categories/laptop-accessories',
    '/categories/budget-gadgets-under-999',
    '/categories/work-from-home-essentials',
    '/top-5',
    '/top-5/best-budget-earbuds-2026',
    '/top-5/top-smartwatches-under-2000',
    '/top-5/best-fast-chargers-2026',
    '/reviews',
    '/reviews/boat-bassheads-100-review',
    '/reviews/mi-power-bank-review',
    '/reviews/oneplus-buds-z2-review',
    '/reviews/noise-colorfit-pro-4-review',
    '/blog',
    '/blog/best-power-banks-guide',
    '/blog/wfh-setup-under-5000',
    '/blog/budget-tech-gifts-guide',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-conditions',
    '/affiliate-disclosure',
    '/search',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : route.startsWith('/categories') || route.startsWith('/top-5') ? 0.8 : 0.6,
  }));

  // Fetch Neon DB products or fallback
  let dynamicProducts: any[] = [];
  try {
    dynamicProducts = await getAllNeonProducts();
  } catch (e) {
    dynamicProducts = (productsData as any).products || [];
  }

  const productRoutes = dynamicProducts.map((prod) => ({
    url: `${BASE_URL}/products/${prod.slug || prod.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
