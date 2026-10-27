import type { MetadataRoute } from 'next';
import { site } from '@/lib/content/site';

// Wajib untuk `output: 'export'` — tanpa ini build gagal.
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fffaf4',
    theme_color: '#6f3c22',
    lang: site.lang,
    icons: [
      { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
