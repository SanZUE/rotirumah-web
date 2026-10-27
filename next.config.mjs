/** @type {import('next').NextConfig} */

// GitHub Pages menyajikan repo project di /rotirumah-web/.
// Di lokal (npm run dev) basePath kosong supaya http://localhost:3000 tetap jalan.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    // GitHub Pages tidak punya image optimizer; semua gambar sudah dioptimasi
    // saat build oleh scripts/optimize-images.mjs.
    unoptimized: true,
  },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
