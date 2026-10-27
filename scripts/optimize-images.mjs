#!/usr/bin/env node
/**
 * Pipeline gambar RotiRumah.
 *
 * Sumber : assets/img-src/<slug>.{png,jpg,jpeg,webp}
 * Hasil  : public/img/<slug>-<lebar>.{avif,webp,jpg}  (beberapa lebar, untuk srcset)
 *          public/img/<slug>.lqip  -> base64 disimpan di manifest
 *          lib/images.generated.ts  -> manifest yang dipakai components/Picture.tsx
 *
 * Jalankan: npm run images:optimize
 *
 * Mengganti foto cukup dengan menimpa file sumber lalu menjalankan skrip ini;
 * kode halaman tidak perlu diubah.
 */

import { readdir, mkdir, writeFile, stat, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'assets/img-src';
const OUT_DIR = 'public/img';
const MANIFEST = 'lib/images.generated.ts';

/** Rasio target per slug. Default 4:3. */
const ASPECT = {
  hero: 16 / 9,
  dapur: 4 / 5,
  og: 1200 / 630,
};

const WIDTHS = [480, 768, 1080, 1440];

const QUALITY = {
  avif: 52,
  webp: 72,
  jpg: 76,
};

/** Varian JPG cadangan untuk browser sangat lama: 480 + lebar terbesar yang tersedia. */
function jpgWidthsFor(widths) {
  return [...new Set([480, widths[widths.length - 1]])].sort((a, b) => a - b);
}

async function listSources() {
  const entries = await readdir(SRC_DIR);
  return entries
    .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
    .map((file) => ({ slug: basename(file, extname(file)), path: join(SRC_DIR, file) }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function widthsFor(sourceWidth, slug) {
  const aspect = ASPECT[slug] ?? 4 / 3;
  // Lebar maksimum yang masuk akal: jangan melebihi lebar sumber asli.
  const usable = WIDTHS.filter((width) => width <= sourceWidth);
  const list = usable.length ? usable : [Math.min(sourceWidth, WIDTHS[0])];
  // Untuk hero kita butuh lebar besar; pastikan 1440 selalu ada walau sumbernya lebih kecil.
  if (slug === 'hero' && !list.includes(1440)) list.push(1440);
  return { widths: [...new Set(list)].sort((a, b) => a - b), aspect };
}

async function processImage({ slug, path }) {
  const meta = await sharp(path).metadata();
  const { widths, aspect } = widthsFor(meta.width ?? 1024, slug);
  const height = Math.round(1024 / aspect);

  // Crop ke rasio target lalu simpan sebagai buffer 1440px sekali, dipakai ulang.
  const base = await sharp(path)
    .rotate()
    .resize({
      width: 1440,
      height: Math.round(1440 / aspect),
      fit: 'cover',
      position: 'attention',
      withoutEnlargement: false,
    })
    .toBuffer();

  const files = [];

  const jpgWidths = jpgWidthsFor(widths);

  for (const width of widths) {
    const resized = sharp(base).resize({ width });

    const avif = join(OUT_DIR, `${slug}-${width}.avif`);
    const webp = join(OUT_DIR, `${slug}-${width}.webp`);
    await resized.clone().avif({ quality: QUALITY.avif, effort: 6 }).toFile(avif);
    await resized.clone().webp({ quality: QUALITY.webp, effort: 6 }).toFile(webp);
    files.push(avif, webp);

    if (jpgWidths.includes(width)) {
      const jpg = join(OUT_DIR, `${slug}-${width}.jpg`);
      await resized.clone().jpeg({ quality: QUALITY.jpg, mozjpeg: true }).toFile(jpg);
      files.push(jpg);
    }
  }

  // LQIP: 20px webp -> data URI (dipakai sebagai background blur sebelum gambar asli tampil)
  const lqipBuffer = await sharp(base).resize({ width: 20 }).webp({ quality: 40 }).toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;

  // OG image khusus 1200x630
  if (slug === 'hero') {
    await sharp(base)
      .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile('public/og.jpg');
  }

  // Rata-rata warna (resize ke 1x1): dipakai sebagai warna latar placeholder
  const { data: avg } = await sharp(base).resize(1, 1).raw().toBuffer({ resolveWithObject: true });
  const hex =
    '#' +
    [avg[0], avg[1], avg[2]]
      .map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0'))
      .join('');

  return {
    slug,
    widths,
    aspect: Number(aspect.toFixed(4)),
    height,
    lqip,
    color: hex,
    bytes: (await Promise.all(files.map(async (file) => (await stat(file)).size))).reduce((a, b) => a + b, 0),
  };
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.error(`Folder ${SRC_DIR} tidak ada.`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const sources = await listSources();
  if (!sources.length) {
    console.error(`Tidak ada gambar di ${SRC_DIR}.`);
    process.exit(1);
  }

  const results = [];
  let total = 0;

  for (const source of sources) {
    const result = await processImage(source);
    results.push(result);
    total += result.bytes;
    console.log(
      `  ${result.slug.padEnd(16)} ${result.widths.join('/')}px  ${(result.bytes / 1024).toFixed(0)} KB`,
    );
  }

  const manifest = `// FILE INI DIHASILKAN OTOMATIS oleh scripts/optimize-images.mjs
// Jangan diedit manual. Jalankan \`npm run images:optimize\` untuk memperbarui.

export type ImageAsset = {
  slug: string;
  widths: number[];
  aspect: number;
  /** data URI 20px untuk placeholder blur */
  lqip: string;
  /** warna dominan sebagai fallback */
  color: string;
};

export const images = {
${results
  .map(
    (result) => `  '${result.slug}': {
    slug: '${result.slug}',
    widths: [${result.widths.join(', ')}],
    aspect: ${result.aspect},
    lqip: '${result.lqip}',
    color: '${result.color}',
  },`,
  )
  .join('\n')}
} satisfies Record<string, ImageAsset>;

export type ImageSlug = keyof typeof images;

export function getImage(slug: string): ImageAsset | undefined {
  return (images as Record<string, ImageAsset>)[slug];
}
`;

  await writeFile(MANIFEST, manifest, 'utf8');

  console.log('');
  console.log(`${results.length} gambar diproses, total ${(total / 1024 / 1024).toFixed(2)} MB di ${OUT_DIR}/`);
  console.log(`Manifest ditulis ke ${MANIFEST}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
