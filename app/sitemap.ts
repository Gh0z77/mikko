import type { MetadataRoute } from 'next';
import { refreshCatalog } from '@/lib/catalog';
import { siteUrl } from '@/lib/site';

const pages = ['', '/catalog', '/boys', '/girls', '/baby', '/shoes', '/accessories', '/sale', '/stores', '/about'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();
  const products = await refreshCatalog();
  return [
    ...pages.map((path) => ({ url: `${site}${path}`, changeFrequency: 'weekly' as const, priority: path ? 0.8 : 1 })),
    ...products.map((p) => ({ url: `${site}/product/${p.slug}`, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
