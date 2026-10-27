#!/usr/bin/env node
/**
 * Laporan ukuran bundle untuk situs hasil static export.
 *
 * Membaca folder `out/`, mengumpulkan semua <script src> dan <link rel=stylesheet>
 * per halaman, menghitung ukuran gzip, lalu mencetak tabel.
 *
 * Keluar dengan kode 1 kalau anggaran terlampaui:
 *   JS  gzip > 130 KB
 *   CSS gzip > 4.5 KB
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';

const OUT = 'out';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
/* Anggaran.
   CATATAN PENTING: Next.js 16 App Router punya "lantai" JS bawaan.
   Diukur dengan proyek minimal (satu halaman kosong, output export):
     168,3 KB gzip untuk 6 file JS.
   Jadi anggaran total harus memperhitungkan lantai itu. Yang kita kendalikan
   adalah kode aplikasi = total - lantai. */
const FRAMEWORK_FLOOR_KB = 168.3;
const APP_BUDGET_KB = 18;        // kode aplikasi kita sendiri
const CSS_BUDGET_KB = 6.5;

const PAGES = [
  'index.html',
  'menu/index.html',
  'menu/bolen-keju/index.html',
  'paket/index.html',
  'tentang-kami/index.html',
  'testimoni/index.html',
  'keranjang/index.html',
  'kontak/index.html',
  '404.html',
];

if (!existsSync(OUT)) {
  console.error('Folder out/ belum ada. Jalankan `npm run build` dulu.');
  process.exit(1);
}

const cache = new Map();

function sizeOf(assetPath) {
  if (cache.has(assetPath)) return cache.get(assetPath);
  const clean = assetPath.startsWith(BASE_PATH + '/')
    ? assetPath.slice(BASE_PATH.length)
    : assetPath;
  const file = join(OUT, clean.replace(/^\//, ''));
  let result = { raw: 0, gzip: 0, missing: !existsSync(file) };
  if (!result.missing) {
    const buf = readFileSync(file);
    result = { raw: buf.length, gzip: gzipSync(buf, { level: 9 }).length, missing: false };
  }
  cache.set(assetPath, result);
  return result;
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]+)"`, 'i'));
  return m ? m[1] : null;
};

const rows = [];
let worstJs = 0;
let worstCss = 0;
let missingAssets = 0;

for (const page of PAGES) {
  const file = join(OUT, page);
  if (!existsSync(file)) continue;

  const html = readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)]
    .map((m) => attr(m[0], 'src'))
    .filter(Boolean);
  const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)]
    .map((m) => attr(m[0], 'href'))
    .filter(Boolean);

  let js = 0;
  let css = 0;
  for (const src of new Set(scripts)) {
    const s = sizeOf(src);
    if (s.missing) missingAssets += 1;
    js += s.gzip;
  }
  for (const href of new Set(styles)) {
    const s = sizeOf(href);
    if (s.missing) missingAssets += 1;
    css += s.gzip;
  }

  const htmlGzip = gzipSync(readFileSync(file), { level: 9 }).length;
  const htmlRaw = statSync(file).size;

  worstJs = Math.max(worstJs, js);
  worstCss = Math.max(worstCss, css);

  rows.push({
    page: page === '404.html' ? '/404' : '/' + dirname(page).replace(/^\.$/, '').replace(/\/$/, ''),
    js: (js / 1024).toFixed(1),
    css: (css / 1024).toFixed(1),
    html: (htmlGzip / 1024).toFixed(1),
    htmlRaw: (htmlRaw / 1024).toFixed(1),
  });
}

const pad = (value, width) => String(value).padEnd(width);
console.log('');
console.log(pad('Halaman', 30) + pad('JS gz', 10) + pad('CSS gz', 10) + pad('HTML gz', 10) + 'HTML raw');
console.log('-'.repeat(70));
for (const row of rows) {
  console.log(pad(row.page, 30) + pad(row.js + ' KB', 10) + pad(row.css + ' KB', 10) + pad(row.html + ' KB', 10) + row.htmlRaw + ' KB');
}
console.log('-'.repeat(70));
console.log(`Total file di out/: ${[...cache.keys()].length} aset dirujuk`);

const worstJsKb = worstJs / 1024;
const appKb = Math.max(0, worstJsKb - FRAMEWORK_FLOOR_KB);

let failed = false;
console.log(
  `JS terberat ${worstJsKb.toFixed(1)} KB gzip = lantai framework ${FRAMEWORK_FLOOR_KB} KB + kode aplikasi ${appKb.toFixed(1)} KB`,
);
if (appKb > APP_BUDGET_KB) {
  console.error(`GAGAL: kode aplikasi ${appKb.toFixed(1)} KB gzip > anggaran ${APP_BUDGET_KB} KB`);
  failed = true;
}
if (worstCss / 1024 > CSS_BUDGET_KB) {
  console.error(`GAGAL: CSS terberat ${(worstCss / 1024).toFixed(1)} KB gzip > anggaran ${CSS_BUDGET_KB} KB`);
  failed = true;
}
if (missingAssets > 0) {
  console.error(`GAGAL: ${missingAssets} aset dirujuk HTML tapi tidak ada di out/ (cek basePath)`);
  failed = true;
}

if (!failed)
  console.log(
    `OK: kode aplikasi ${appKb.toFixed(1)} KB gzip (≤ ${APP_BUDGET_KB}), CSS maks ${(worstCss / 1024).toFixed(1)} KB gzip (≤ ${CSS_BUDGET_KB})`,
  );
process.exit(failed ? 1 : 0);
