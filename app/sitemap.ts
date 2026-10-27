import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/content/site';
import { products } from '@/lib/data';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ['', 'menu/', 'paket/', 'tentang-kami/', 'testimoni/', 'kontak/', 'keranjang/'];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}/${route}`,
      lastModified: now,
      changeFrequency: (route === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: route === '' ? 1 : route === 'menu/' ? 0.9 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/menu/${product.slug}/`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
