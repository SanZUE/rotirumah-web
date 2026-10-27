# RotiRumah Web

Website etalase + pemesanan untuk toko roti rumahan RotiRumah.
Statis sepenuhnya (Next.js `output: 'export'`), tayang di **GitHub Pages**.

- Produksi: <https://sanzue.github.io/rotirumah-web/>
- Rencana & keputusan teknis: [`docs/RENCANA-UPGRADE.md`](docs/RENCANA-UPGRADE.md)

## Stack

| Bagian | Pilihan | Catatan |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | `output: 'export'`, tanpa server |
| Styling | CSS berlayer (`@layer`) di `styles/` | **tanpa Tailwind, tanpa PostCSS** |
| Animasi | CSS transition/keyframes + 1 IntersectionObserver | tanpa library motion |
| Gambar | `sharp` saat build → AVIF/WebP/JPG + LQIP | tanpa image optimizer server |
| Keranjang | `localStorage` + `useReducer` | sinkron antar-tab, tahan refresh |
| Checkout | WhatsApp (pesan terformat otomatis) | belum ada database |

## Jalankan lokal

```bash
npm install
npm run dev          # http://localhost:3000
```

Perintah lain:

```bash
npm run typecheck        # tsc --noEmit
npm run build            # static export ke folder out/
npm run size:report      # laporan & anggaran ukuran bundle
npm run images:optimize  # regenerate gambar dari assets/img-src/
npm run verify           # typecheck + build + laporan ukuran
```

> `basePath` hanya aktif kalau `NEXT_PUBLIC_BASE_PATH` diisi (dipakai CI untuk GitHub Pages).
> Di lokal biarkan kosong supaya `localhost:3000` tetap jalan.

## Struktur

```text
app/            route + metadata + sitemap/robots/manifest
components/     Picture, Reveal, Cart*, Header, form, kartu produk
lib/content/    data produk, paket, testimoni, konfigurasi situs
lib/            format, cart store, SEO (JSON-LD), manifest gambar hasil generate
styles/         tokens, base, layout, components, motion
scripts/        optimize-images.mjs, report-size.mjs
assets/img-src/ foto sumber (di-commit agar bisa diregenerasi)
public/img/     hasil optimasi (AVIF/WebP/JPG multi-lebar)
.github/workflows/deploy.yml   build + deploy ke GitHub Pages
```

## Mengganti gambar

1. Timpa file di `assets/img-src/` dengan nama slug yang sama
   (`hero`, `bolen-keju`, `bomboloni`, …). Format PNG/JPG/WebP, minimal 1000 px.
2. `npm run images:optimize`
3. Commit `assets/img-src/` **dan** `public/img/` + `lib/images.generated.ts`.

Kode halaman tidak perlu diubah: rasio, ukuran, dan LQIP dihitung otomatis.

> **Catatan kejujuran:** foto yang ada sekarang adalah **ilustrasi hasil generate**,
> bukan foto produk asli RotiRumah. Ganti dengan foto asli sebelum promosi serius.

## Menambah produk / paket

- Produk: `lib/content/products.ts` (`slug`, `name`, `price`, `image`, `imageAlt`, …).
  Halaman detail dibuat otomatis lewat `generateStaticParams`.
- Paket: `lib/content/bundles.ts`.
- Ongkir, minimal belanja, jam, slot, batas jumlah: `lib/content/site.ts`.

## Deploy (GitHub Pages)

Workflow `.github/workflows/deploy.yml` berjalan saat push ke `main`
(dan ke branch kerja untuk preview). Langkahnya: `npm ci` → `typecheck` →
`build` → buat `out/.nojekyll` → upload artefak → deploy.

Syarat sekali pasang di repository:

1. **Settings → Pages → Source: GitHub Actions**
   (API: `PUT /repos/{owner}/{repo}/pages` dengan `build_type=workflow`).
2. Branch yang boleh deploy harus terdaftar di environment `github-pages`
   (Settings → Environments → github-pages → deployment branches).

Tanpa langkah 1, Pages tetap memakai mode lama (Jekyll) dan hanya menampilkan README.

## Anggaran performa

Diukur dengan `npm run size:report` (gzip):

| Metrik | Nilai sekarang | Anggaran |
| --- | --- | --- |
| JS total terberat | 182,8 KB | — |
| Lantai framework Next 16 | 168,3 KB | (diukur dari proyek minimal) |
| **Kode aplikasi** | **14,5 KB** | ≤ 18 KB |
| CSS | 5,8 KB | ≤ 6,5 KB |
| Hero AVIF 1080 | 41,5 KB | ≤ 90 KB |
| Request pihak ketiga | 0 | 0 |
| HTML per halaman | 4,4–8,0 KB | — |

Lantai 168 KB berasal dari runtime Next/React untuk halaman apa pun; itu bukan
kode kita. Kalau angka itu ingin turun drastis, pilihannya bukan optimasi CSS
tapi ganti pendekatan render (mis. situs non-React), yang di luar lingkup project ini.

## Diagnosis error

1. File mana yang berubah?
2. Data datang dari mana?
3. Apa pesan error pertama yang asli?
