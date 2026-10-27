# Rencana Upgrade RotiRumah Web

**Status:** draft untuk disetujui · **Tanggal:** 27 Oktober 2026
**Basis kode:** `c459dea` (branch `arena/f64c144f-rotirumah-web`)
**Sasaran:** upgrade animasi + optimalisasi + efisiensi, hasil akhir tampil di **GitHub Pages**

**Isi:** §0 ringkasan & keputusan · §1 audit terukur · §2 kendala GitHub Pages · §3 arsitektur target ·
§4 frontend (motion, gambar, a11y, SEO) · §5 backend · §6 anggaran performa · §7 deployment ·
§8 roadmap · §9 peta file · §10 risiko · §11 definition of done · §12 langkah pertama ·
lampiran B (checkout T0) · C (kontrak motion) · D (workflow & perintah deploy) · E (skrip QA)

---

## 0. Ringkasan eksekutif

Audit singkat menemukan **satu masalah yang lebih penting dari semua masalah animasi**: website yang sekarang
tayang di GitHub Pages **bukan aplikasi Next.js-nya**, melainkan README.md yang dirender Jekyll.

| Temuan | Bukti |
| --- | --- |
| Pages aktif dengan `build_type: legacy`, source `main:/` | `GET /repos/SanZUE/rotirumah-web/pages` |
| Isi `https://sanzue.github.io/rotirumah-web/` = judul + isi README | verifikasi fetch halaman live |
| Repo tidak punya `index.html` di root, jadi Jekyll merender README | struktur repo |
| Environment `github-pages` hanya mengizinkan branch `main` | `deployment-branch-policies` → `[{name: main}]` |

Artinya: **Fase 0 harus deployment**, bukan animasi. Tanpa itu, semua upgrade tidak akan pernah terlihat di Pages.

Ringkasan kondisi teknis hari ini (semua diukur, bukan perkiraan):

| Metrik | Sekarang | Catatan |
| --- | --- | --- |
| Halaman statis ter-generate | 18 | build sukses di Next 16.3.5 (Turbopack) |
| First-load JS | **563,7 KB mentah / 173,0 KB gzip** | 8–9 file JS, chunk terbesar 223,8 KB |
| CSS | 15,7 KB mentah / 4,3 KB gzip (1 file) | dari situ ~4 KB mentah hanya preflight Tailwind |
| HTML per halaman | 11,9–27,2 KB (≈4,2 KB gzip) | wajar |
| Total `out/` | 1,8 MB | tanpa folder gambar lokal |
| Gambar | 12 URL Unsplash unik (dipakai 15×), `w=1000/1200`, tanpa `srcset`, tanpa dimensi | LCP bergantung pihak ketiga |
| Font | Arial/Helvetica + Georgia (sistem) | 0 KB, aman |
| Kontras teks `eyebrow` | **3,27:1** (butuh 4,5:1) | gagal WCAG AA di semua halaman |
| Kontras `muted` di atas band | **4,20:1** | gagal marginal |
| `h1` ganda di `/keranjang` saat kosong | 2 × `<h1>` | masalah semantik |
| Interaksi | 0 animasi, belum ada `prefers-reduced-motion` | — |
| Backend | tidak ada; keranjang `localStorage`; checkout = link WhatsApp | — |

Kesimpulan arah: **static-first (output export) + islands kecil + motion berbiaya nol JS runtime + backend opsional BaaS**.
Bukan menambah library animasi besar, bukan memindahkan framework.

### 0.1 Keputusan final (disetujui 27 Okt 2026)

| Topik | Keputusan | Konsekuensi teknis |
| --- | --- | --- |
| Gambar | **Placeholder fotorealistis dibuat sendiri** (AI), disimpan lokal | 0 request pihak ketiga; 15 aset sumber → pipeline `sharp`; mudah ditukar dengan foto asli nanti |
| Tailwind | **Dihapus** | `postcss.config.mjs` dihapus, 3 devDependency dicabut, reset CSS ditulis sendiri (±1,2 KB), styling seluruhnya CSS semantik ber-`@layer` |
| Backend | **T0 saja** untuk iterasi ini | checkout WhatsApp diperkaya (pickup/ongkir, tanggal, slot, catatan, kode pesanan); tidak ada dependensi eksternal; skema T1–T2 tetap didokumentasikan |
| Rilis | **Dua-duanya** | workflow deploy dari `main` *dan* branch kerja (branch kerja ditambahkan ke deployment branch policy), lalu PR tetap di-merge ke `main` sebagai rilis resmi |

Konsekuensi jujur soal gambar: foto AI bukan produk asli RotiRumah. Semua aset akan diberi nama jelas,
didokumentasikan di `README.md`, dan **pipeline tukar-gambar dibuat satu perintah** (`assets/img-src/` →
`npm run images:optimize`) supaya penggantian dengan foto asli nanti tidak menyentuh kode sama sekali.

---

## 1. Audit kondisi saat ini

### 1.1 Arsitektur & alur data

```
lib/data.ts (hardcoded, 9 produk + 4 paket + 3 testimoni)
        │
        ├── app/page.tsx ───────────── server component
        ├── app/menu/page.tsx ──────── server component
        ├── app/menu/[slug]/page.tsx ─ generateStaticParams (9 halaman)
        ├── app/paket, tentang-kami, testimoni ─ server
        ├── app/keranjang/page.tsx ─── 'use client' (SELURUH halaman)
        └── app/kontak/page.tsx ────── 'use client' (SELURUH halaman)

CartProvider ('use client', localStorage `rotirumah-cart-v1`)
        └── Header → CartBadge (client) + MobileNav (client)
```

Tidak ada API route, tidak ada database, tidak ada `fetch`. Cocok untuk `output: 'export'`, **tetapi** belum
dikonfigurasi untuk itu (`next.config.mjs` hanya `turbopack.root`).

### 1.2 Masalah per kategori

**Deployment / platform**

1. Pages legacy dari `main` → yang tayang README.
2. Tidak ada `basePath`. Repo project site hidup di `/rotirumah-web/`; semua `href="/menu"` akan 404 kalau
   nanti di-export tanpa `basePath`.
3. Tidak ada `.nojekyll`. GitHub Pages memakai Jekyll yang **mengabaikan folder berawalan `_`**, padahal output
   Next berisi `_next/`, `_not-found/`. Tanpa `.nojekyll`, CSS/JS tidak akan tersaji.
4. Tidak ada workflow CI; tidak ada build verification di PR.
5. `package.json` tidak punya `lint`, `typecheck`, atau skrip export.

**Performa**

6. 173 KB gzip JS untuk situs yang isinya teks + gambar. Porsi besar = runtime React/Next, tapi sebagian bisa
   dipangkas: `/keranjang` dan `/kontak` dijadikan client component utuh, `loading.tsx`/`error.tsx` tidak berguna
   di mode export, dan boundary client bisa diperkecil.
7. Hero LCP adalah `background-image` di CSS (`w=1800&q=85`): tidak bisa di-`preload`, tidak punya `srcset`,
   tidak diketahui browser sebelum CSS selesai diparse. Ini penyebab LCP lambat paling besar.
8. Semua `<img>` tanpa `width`/`height` → risiko CLS; `.bundle img` bahkan tanpa aspect-ratio.
9. Tidak ada `loading="lazy"`/`decoding="async"`; semua gambar di bawah fold ikut diminta segera.
10. `rupiah()` membuat instance `Intl.NumberFormat` baru di setiap pemanggilan (dipanggil puluhan kali per render).
11. `CartProvider`: satu context untuk state + aksi → setiap perubahan qty me-render ulang semua konsumen.
12. `localStorage` dibaca di `useEffect` tanpa flag hidrasi → `/keranjang` sempat menampilkan "Keranjang kosong"
    selama 1 frame sebelum data asli muncul (flash of empty state).
13. CSS dinamai semantik tapi tidak berlapis (`@layer`) dan Tailwind praktis tidak dipakai (hanya preflight).

**Animasi / UX**

14. Nol motion: tidak ada feedback saat menambah ke keranjang (hanya teks tombol berganti via `setTimeout`
    tanpa cleanup), tidak ada transisi kartu, tidak ada scroll reveal.
15. `scroll-behavior: smooth` global tanpa menghormati `prefers-reduced-motion`.
16. `.mobile-menu` tidak menangani Escape, klik luar, focus trap, atau scroll lock.
17. `.nav-pill` (keranjang) disembunyikan di bawah 560 px → **di ponsel tidak ada indikator jumlah item**,
    akses keranjang hanya lewat menu hamburger.
18. Tab kategori di `/menu` hanya `<span>` — terlihat klikabel, tidak berfungsi.
19. `setTimeout` di `ProductDetailClient` tidak dibersihkan saat unmount.

**Aksesibilitas & SEO**

20. Kontras `--accent #c87746` = 3,27:1 (gagal) untuk teks 12 px; di atas `.band` = 2,97:1.
21. `--muted #806f64` di atas `.band #f8eee6` = 4,20:1 (gagal marginal).
22. `/keranjang` punya dua `<h1>` saat kosong.
23. Tidak ada favicon, `icon`, `apple-touch-icon`, `theme-color`, OG/Twitter card, `canonical`, `sitemap.xml`,
    `robots.txt`, `manifest`, atau JSON-LD (`LocalBusiness`/`Product`). Semua permintaan `/favicon.ico` = 404.
24. `<main>` tidak `tabIndex={-1}` → skip link memindahkan fokus tapi tidak selalu terlihat.
25. Deskripsi metadata generik: "Website toko roti rumahan RotiRumah." di semua halaman.

**Domain bisnis (bukan kode, tapi memblokir "upgrade")**

26. Ongkir `Rp10.000` dipaksakan untuk semua pesanan, tidak ada opsi ambil sendiri (pickup = Rp0).
27. Checkout tidak menangkap: tanggal ambil/kirim (krusial untuk pre-order roti), catatan, nama, alamat.
28. Tidak ada batas jumlah per item, tidak ada status stok/habis.
29. Pesanan hanya jadi teks WhatsApp — tidak ada arsip, tidak bisa dihitung omzetnya.

---

## 2. Kendala platform: GitHub Pages vs Next.js

Sudah saya uji nyata di sandbox (bukan asumsi). `output: 'export'` + `basePath` + `trailingSlash` berhasil
menghasilkan 18 halaman statis.

| Fitur Next | Di GitHub Pages | Keputusan |
| --- | --- | --- |
| `next build` (SSG) | ✅ | dipakai |
| Route dinamis `[slug]` | ✅ asal `generateStaticParams` | sudah ada |
| API Routes / Route Handlers | ❌ | backend ke BaaS |
| `middleware.ts` | ❌ | tidak dipakai |
| ISR / `revalidate` | ❌ | data dibekukan saat build |
| `next/image` optimizer | ❌ (server) | `images.unoptimized` + `<picture>` buatan sendiri |
| Server Actions | ❌ | form → BaaS / WhatsApp |
| Streaming + `loading.tsx` | ❌ tidak relevan | hapus, ganti skeleton klien |
| `sitemap.ts` / `robots.ts` | ✅ (uji: terbentuk `sitemap.xml`, `robots.txt`) | pakai |
| `manifest.ts` | ⚠️ **wajib** `export const dynamic = 'force-static'` | pakai dengan catatan |
| Folder `_next/` | ⚠️ butuh `.nojekyll` | wajib |
| Preview per-branch | ❌ environment policy hanya `main` | lihat §7.3 |

**Verifikasi yang sudah dilakukan di sandbox:**

- `npx next build` (sekarang): sukses, 18 halaman.
- `output:'export'` + `basePath:/rotirumah-web` + `trailingSlash:true`: sukses, `out/index.html`,
  `out/404.html`, `out/menu/bolen-keju/index.html`, dan semua `href`/`src` otomatis berprefiks
  `/rotirumah-web/...`.
- `app/manifest.ts` gagal build sampai ditambah `dynamic = 'force-static'` (error asli sudah saya lihat).
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest` ter-generate dengan benar setelah perbaikan itu.
- Network sandbox memblokir `images.unsplash.com` dan `fonts.googleapis.com`, **tetapi** `registry.npmjs.org`
  terbuka → `sharp` dan `@fontsource-variable/*` bisa dipakai.

---

## 3. Arsitektur target

```
┌──────────────────────────── GitHub Pages (static CDN) ────────────────────────────┐
│  out/                                                                            │
│   ├─ index.html, menu/, paket/, tentang-kami/, testimoni/, keranjang/, kontak/    │
│   ├─ 404.html                                                                     │
│   ├─ sitemap.xml, robots.txt, manifest.webmanifest, .nojekyll                     │
│   ├─ _next/static/chunks/*.js|css   (hash, immutable)                             │
│   └─ img/{hero,produk,paket}  AVIF + WebP + JPG, 4 lebar                          │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │ build-time: NEXT_PUBLIC_* di-inline
┌──────────────────────────────────────┴───────────────────────────────────────────┐
│ Klien (islands kecil, total ≤ ~25 KB gzip JS tambahan)                           │
│  • CartProvider (useReducer, localStorage, multi-tab)                            │
│  • MobileNav drawer, CartDrawer, Toast, QuantityStepper, FilterTabs               │
│  • Reveal (IntersectionObserver tunggal, no dependency)                           │
└──────────────────────────────────────┬───────────────────────────────────────────┘
                                       │ hanya kalau backend diaktifkan (opsional)
┌──────────────────────────────────────┴───────────────────────────────────────────┐
│ Supabase (Postgres + RLS + Auth + Edge Function)                                 │
│  katalog produk/paket · orders · order_items · testimonials · settings            │
│  RPC create_order(): harga dihitung ulang di server, anti-manipulasi              │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Prinsip yang dipakai konsisten:**

1. **Static by default** — semua halaman tetap prerender; JS hanya untuk interaksi.
2. **Islands kecil** — halaman server, hanya bagian interaktif yang client.
3. **Progressive enhancement** — tanpa JS situs tetap bisa dibaca & bisa pesan via WhatsApp.
4. **Nol dependency animasi** — CSS transition/animation + satu IntersectionObserver.
5. **Degradasi anggun** — kalau Supabase mati/tidak dikonfigurasi, situs jatuh ke data snapshot + WhatsApp.

---

## 4. Rencana Frontend

### 4.1 Struktur file setelah upgrade

```
app/
  layout.tsx            metadata lengkap, viewport, font, provider, skip link
  page.tsx              hero <picture> + reveal
  menu/page.tsx         filter kategori nyata (deep-link ?kategori=)
  menu/[slug]/page.tsx  + JSON-LD Product, Picture, related
  keranjang/page.tsx    shell server + <CartView/> client
  kontak/page.tsx       shell server + <ContactForm/> client
  paket/ tentang-kami/ testimoni/
  error.tsx not-found.tsx            (loading.tsx dihapus — tidak dipakai di export)
  sitemap.ts robots.ts manifest.ts icon.svg apple-icon.png opengraph-image.tsx
components/
  Picture.tsx           <picture> AVIF/WebP/JPG + srcset + width/height + priority
  Reveal.tsx            wrapper scroll-reveal (CSS-driven)
  Header.tsx MobileNav.tsx CartBadge.tsx CartDrawer.tsx
  ProductCard.tsx ProductDetailClient.tsx QuantityStepper.tsx FilterTabs.tsx
  Toast.tsx Skeleton.tsx
lib/
  content/{products,bundles,testimonials,site}.ts   data + tipe + slug paket
  format.ts             Intl.NumberFormat di-cache, helper rupiah
  cart/store.ts         reducer + dua context (state/actions)
  images.generated.ts   manifest gambar hasil sharp
  seo.ts                builder JSON-LD
  supabase.ts           opsional, lazy, feature-flag
styles/  tokens.css base.css layout.css components.css motion.css
scripts/ optimize-images.mjs
.github/workflows/deploy.yml
```

### 4.2 Sistem motion (animasi)

Prinsip: **animasi harus terasa mahal, tapi biayanya nol**. Semua properti yang dianimasikan = `transform` dan
`opacity` (compositor-only). Tidak ada animasi `width/height/top/left/box-shadow` yang memicu layout/paint
kecuali pada elemen kecil dan sekali jalan.

**Token motion** (`styles/motion.css`):

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--dur-1` | 120 ms | press, hover kecil |
| `--dur-2` | 180 ms | hover kartu, tombol, badge |
| `--dur-3` | 280 ms | drawer, toast, reveal |
| `--dur-4` | 420 ms | hero masuk, transisi halaman |
| `--ease-out` | `cubic-bezier(.22,.61,.36,1)` | masuk/keluar standar |
| `--ease-spring` | `cubic-bezier(.34,1.4,.64,1)` | bounce halus (badge, toast) |

**Daftar animasi yang akan dibuat (prioritas dari atas):**

1. **Scroll reveal** — `.reveal` (opacity 0 → 1, translateY 12 px → 0). Satu `IntersectionObserver`
   singleton di `Reveal.tsx`, `rootMargin: '0px 0px -10%'`, `threshold: 0.15`, langsung `unobserve`
   setelah tampil (tidak ada listener tersisa). Stagger via `style={{'--i': index}}` +
   `transition-delay: calc(var(--i) * 45ms)` dibatasi maksimal 6 item.
2. **Hero entrance** — judul/paragraf/tombol fade+rise sekali saat load (CSS keyframes, `animation-fill-mode: both`),
   totalkan <1 KB CSS, tanpa JS.
3. **Kartu produk** — hover: `translateY(-4px)`, gambar `scale(1.04)` dengan `overflow:hidden`,
   border jadi `--line-strong`. Fokus keyboard mendapat efek sama (`:focus-within`).
4. **Tombol** — hover naik 1 px, `:active` `scale(.985)`; tanpa shadow animasi.
5. **Cart badge** — angka berganti dengan keyframe "pop" 280 ms; badge disembunyikan kalau 0.
6. **Cart drawer** — slide-in dari kanan 280 ms + backdrop fade; `role="dialog" aria-modal`, focus trap,
   Escape, klik backdrop, `scrollbar-gutter: stable` agar tidak ada layout shift saat scroll dikunci.
7. **Toast** — "Ditambahkan ke keranjang" (menggantikan `setTimeout` di tombol) dengan `aria-live="polite"`,
   auto-dismiss 2,5 s, bisa ditutup, timer dibersihkan saat unmount.
8. **Skeleton gambar** — kartu memakai LQIP base64 ±300 byte (dibuat sharp) sebagai `background-image` +
   `filter: blur(12px)` sampai gambar `onLoad` → transisi opacity. Menggantikan kotak kosong.
9. **Header mengecil saat scroll** — hanya `transform: scale()` pada padding internal? **Tidak.** Gunakan
   `position: sticky` + perubahan `--header-h` lewat kelas yang ditambahkan oleh satu listener `scroll`
   pasif + `requestAnimationFrame` (throttled), sekali per frame.
10. **Garis bawah nav** — `::after` scaleX 0 → 1, origin kiri.
11. **Hormati `prefers-reduced-motion`** — dua lapis: media query CSS mematikan semua transisi/animasi, dan
    `Reveal.tsx` mengecek `matchMedia` lalu langsung menampilkan konten tanpa observer.
12. **Opsional (kalau diminta): transisi halaman** — `prefers-reduced-motion` aware + `document.startViewTransition`
    pada klik link internal (progressive enhancement, tanpa library). Ditunda ke Fase 5 karena berisiko
    mengganggu navigasi keyboard.

**Yang sengaja TIDAK dipakai:** Framer Motion/Motion (~15–30 KB gzip), GSAP (~25 KB), AOS, Lottie, animasi
`scroll-timeline` eksperimental sebagai dependensi utama. Kalau nanti butuh orkestrasi kompleks, baru dievaluasi.

**Anggaran motion:** ≤ 2 KB gzip CSS tambahan, 0 KB library, 0 animasi yang berjalan saat idle.

### 4.3 Gambar & aset (bagian terbesar LCP)

Karena Pages tidak punya image optimizer, optimasi dilakukan **saat build** (dan hasilnya ikut di-commit):

1. `scripts/optimize-images.mjs` (pakai `sharp`):
   - sumber: `assets/img-src/*.jpg` (foto asli, boleh besar)
   - hasil: `public/img/<nama>-<lebar>.{avif,webp,jpg}` untuk lebar `480, 768, 1080, 1440`
   - plus LQIP: 20 px WebP → base64 → tulis ke `lib/images.generated.ts`
2. `components/Picture.tsx`:
   ```tsx
   <Picture
     name="hero"
     alt="Roti hangat di atas meja kayu"
     sizes="100vw"
     priority            // → loading="eager" fetchpriority="high" + <link rel="preload">
     aspect={16 / 9}
   />
   ```
   Output `<picture>` dengan `<source type="image/avif">`, `<source type="image/webp">`, fallback `<img>`,
   `width`/`height` eksplisit, `decoding="async"`, `loading` otomatis (`lazy` kecuali `priority`).
3. Hero berubah dari `background-image` CSS menjadi `<Picture priority>` → LCP bisa di-preload dan punya srcset.
4. Target: halaman beranda ≤ 500 KB total transfer di 4G, hero ≤ 90 KB (AVIF, 1080 px).

**Daftar aset yang akan dibuat** (semua disimpan lokal, tanpa pihak ketiga):

| Slug | Rasio | Dipakai di | Lebar hasil |
| --- | --- | --- | --- |
| `hero` | 16:9 | beranda (LCP, `priority`) | 1440 |
| `bolen-keju`, `bolen-cokelat`, `bomboloni`, `roti-sobek`, `roti-keju`, `roti-cokelat`, `roti-sosis`, `bolen-durian` | 4:3 | kartu produk, detail | 1080 |
| `paket-ngopi`, `paket-hampers`, `paket-keluarga`, `paket-spesial` | 4:3 | `/paket`, beranda | 1080 |
| `paket-lebaran` | 4:3 | kartu produk musiman | 1080 |
| `dapur` | 4:5 | `/tentang-kami` | 1080 |
| `og` | 1200×630 | Open Graph (statis, bukan AI) | 1200 |

Total 15 foto + 1 OG. Semua di-generate sekali, di-resize ke 4 lebar (AVIF/WebP/JPG), lalu folder sumber
(`assets/img-src/`, ±15 file) tetap di-commit agar bisa diregenerasi. Estimasi hasil akhir `public/img/`:
±3–4 MB untuk 60+ file — masih di bawah batas wajar repo, dan hanya 1–4 file yang dimuat per halaman.

**Cara mengganti dengan foto asli nanti (tanpa ubah kode):**
1. Taruh foto baru di `assets/img-src/` dengan nama slug yang sama (mis. `bolen-keju.jpg`).
2. `npm run images:optimize`.
3. Commit. Kode, alt text, dan layout tidak berubah.

### 4.4 Aksesibilitas

**Palet final** (semua pasangan sudah dihitung, target WCAG AA 4,5:1 untuk teks normal):

| Token | Nilai | Di atas | Rasio |
| --- | --- | --- | --- |
| `--accent` (baru) | `#a05226` | cream `#fffaf4` | 5,42 ✅ |
| `--accent` | `#a05226` | band `#f8eee6` | 4,92 ✅ |
| `--accent` | `#a05226` | paper `#fffdf9` | 5,54 ✅ |
| `--muted` (baru) | `#7a6a5f` | band `#f8eee6` | 4,53 ✅ |
| `--muted` | `#7a6a5f` | cream | 4,99 ✅ |
| `--brown` | `#6f3c22` | cream | 8,63 ✅ |
| `--on-brown` | `#ffffff` | `#6f3c22` | 8,95 ✅ |
| teks tombol accent | `#ffffff` | `#a05226` | 5,63 ✅ |

Nilai lama yang gagal: `--accent #c87746` = 3,27 (cream) / 2,97 (band); `--muted #806f64` di band = 4,20.
`--accent-soft` boleh tetap terang untuk border/ikon dekoratif, tapi tidak untuk teks.

- Satu `<h1>` per halaman; `/keranjang` kosong memakai `<h2>`.
- `<main id="main-content" tabIndex={-1}>` supaya skip link benar-benar memindahkan fokus.
- Drawer & toast: `role="dialog"`/`aria-live`, Escape, focus trap, `inert` untuk konten belakang.
- Form kontak: `aria-describedby`, pesan error `role="alert"`, validasi nomor WA, `inputmode="tel"`.
- Semua target sentuh ≥ 44×44 px (tombol qty sekarang 38 px → 44 px).
- Tab kategori `/menu` jadi `<Link>`/`aria-pressed` sungguhan, bisa diakses keyboard.

### 4.5 SEO & metadata

- `metadata` per halaman + `metadataBase`, `openGraph`, `twitter`, `alternates.canonical` (pakai `NEXT_PUBLIC_SITE_URL`).
- `app/icon.svg`, `app/apple-icon.png`, `theme-color: #6f3c22`.
- `sitemap.ts` (semua produk + paket), `robots.ts`, `manifest.ts` (+ `dynamic='force-static'`).
- JSON-LD: `Bakery`/`LocalBusiness` (nama, telp, jam buka, area) di layout; `Product` + `Offer` di detail produk;
  `BreadcrumbList` di halaman produk.
- `opengraph-image` statis 1200×630 (dibuat dari komposisi brand, bukan runtime).

---

## 5. Rencana Backend

### 5.1 Kenyataan yang harus diterima

GitHub Pages = hosting file statis. Tidak ada server, tidak ada database, tidak ada rahasia. Jadi "backend"
berarti **layanan pihak ketiga yang dipanggil dari browser**. Yang tidak boleh dilakukan: menaruh API key
rahasia (`service_role`, Midtrans server key) di bundle — semua `NEXT_PUBLIC_*` bisa dibaca siapa pun.

### 5.2 Tangga backend (bisa berhenti di tingkat mana pun)

| Tier | Isi | Butuh apa | Kapan dipakai |
| --- | --- | --- | --- |
| **T0** (sekarang) | Keranjang di `localStorage` → checkout via WhatsApp, pesan terformat + tanggal + catatan | — | pilot, volume rendah |
| **T1** | Katalog dari Supabase (produk/paket bisa diubah tanpa deploy), fallback ke snapshot build | Supabase free | begitu menu sering berubah |
| **T2** | `orders` + `order_items` tersimpan, halaman sukses, admin read-only untuk pesanan | Supabase + RLS + Auth | begitu butuh arsip & rekap |
| **T3** | Admin CRUD produk, notifikasi email/WA otomatis, pembayaran (Midtrans/Xendit) | Edge Function + webhook + verifikasi signature | saat mau serius jualan online |

Rekomendasi: kerjakan **T0 sekarang** (dan sudah jauh lebih baik dari sekarang karena tanggal + catatan +
pickup/ongkir), siapkan skema **T1–T2** di dokumen ini, eksekusi setelah situs stabil di Pages.

### 5.3 Skema database (T2)

```sql
-- inti
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null check (category in ('Andalan','Reguler','Musiman')),
  price integer not null check (price >= 0),
  description text,
  image_key text,             -- kunci manifest gambar, bukan URL
  variants text[] default '{}',
  is_active boolean default true,
  sort_order integer default 0
);

create table bundles  (id uuid primary key default gen_random_uuid(), slug text unique, name text, price integer, description text, items jsonb, image_key text, is_active boolean default true);
create table testimonials (id uuid primary key default gen_random_uuid(), name text, role text, text text, rating int check (rating between 1 and 5), is_published boolean default false);

create type order_status as enum ('baru','dikonfirmasi','dipanggang','siap','selesai','batal');

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                       -- RR-20261027-001
  customer_name text not null,
  customer_phone text not null,
  fulfilment text not null check (fulfilment in ('pickup','delivery')),
  address text,
  delivery_date date,
  delivery_slot text,
  note text,
  subtotal integer not null,
  shipping integer not null default 0,
  total integer not null,
  status order_status not null default 'baru',
  created_at timestamptz default now()
);

create table order_items (
  id bigserial primary key,
  order_id uuid references orders(id) on delete cascade,
  product_slug text not null,
  variant text,
  qty int not null check (qty > 0),
  unit_price integer not null,   -- disalin server, bukan dari klien
  line_total integer not null
);
```

**Keamanan (bagian yang sering salah):**

- RLS aktif di semua tabel. `anon` hanya boleh `select` produk/paket/testimoni yang `is_active`/`is_published`.
- **Insert order lewat RPC** `create_order(payload jsonb)` (`security definer`): fungsi ini membaca harga dari
  tabel, menghitung subtotal/ongkir/total sendiri, membuat `code`, lalu insert `orders` + `order_items`
  dalam satu transaksi. Klien **tidak pernah** mengirim harga.
- Batas: `qty ≤ 50`, minimal total, `delivery_date >= today + 1` (pre-order), rate limit per IP/anon-id.
- Admin memakai Supabase Auth (magic link) + policy berbasis `auth.jwt() ->> 'email' in (…)`.
- `service_role` hanya di Edge Function (server), tidak pernah di bundle.
- Kalau RPC gagal/tidak dikonfigurasi → tombol "Pesan via WhatsApp" tetap ada (degradasi).

### 5.4 Alternatif kalau nanti butuh backend "sungguhan"

| Opsi | Kelebihan | Kekurangan | Kapan |
| --- | --- | --- | --- |
| Pages + Supabase (rekomendasi) | tetap di Pages, gratis, Postgres+Auth+Storage | tidak ada server-side rendering/secret di frontend | default |
| Vercel (repo sudah pernah deploy ke sana) | API routes, cron, image optimizer, preview per-PR | keluar dari permintaan "GitHub Pages" | kalau mau pembayaran/email penuh |
| Cloudflare Workers/Pages Functions | cepat, murah, cron, D1 | dua platform | kalau butuh proxy API ringan |

---

## 6. Efisiensi: anggaran & teknik

| Area | Sekarang | Target | Cara |
| --- | --- | --- | --- |
| First-load JS | 173 KB gzip | **≤ 130 KB**, ideal ≤ 115 KB | pindahkan shell `/keranjang` & `/kontak` ke server component, hapus `loading.tsx`, pisah context cart, tanpa library baru |
| CSS | 4,3 KB gzip | ≤ 4,5 KB **termasuk motion** | `@layer`, hapus kelas mati (`split`, `split-img`, `quote-box`), **buang Tailwind** (preflight ±1,4 KB gzip diganti reset ±0,4 KB gzip) |
| Request pihak ketiga | 12 URL Unsplash (dipakai 15×) | **0** | gambar lokal hasil sharp |
| Prefetch berlebih | semua `<Link>` di viewport ikut prefetch | hanya navigasi utama | `prefetch={false}` untuk grid produk/paket |

| Hero LCP | CSS background 1800 px | ≤ 90 KB AVIF, preload | `<Picture priority>` |
| CLS | berisiko | ≤ 0,02 | width/height + aspect-ratio + LQIP |
| Build | ~11 s | ≤ 15 s | tetap Turbopack |
| Runtime kerja | `Intl` per panggilan, observer per komponen | 1 formatter, 1 observer | cache + singleton |
| Cache | default Pages | hashed asset immutable | nama file ber-hash otomatis Next |
| Aksesibilitas | 2 kegagalan kontras | 0 | palet §4.4 |

Teknik tambahan yang dipakai hati-hati:

- `content-visibility: auto` + `contain-intrinsic-size` untuk section panjang di bawah fold (hemat render).
- `fetchpriority="high"` hanya untuk hero (jangan lebih dari 1).
- Preload **satu** font saja kalau font kustom dipakai; selain itu tetap font sistem (0 KB).
- Tidak memasang service worker di iterasi ini (risiko cache basi pada deploy statis) — masuk daftar opsional Fase 5
  dengan strategi `stale-while-revalidate` + versi cache.
- Tidak memakai React Compiler (belum perlu), tidak `dynamic import` untuk komponen yang selalu tampil.

---

## 7. Deployment ke GitHub Pages

### 7.1 Konfigurasi build

```js
// next.config.mjs
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';   // '' saat dev, '/rotirumah-web' di CI

export default {
  output: 'export',
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};
```

`.env.example` ditambah:

```
NEXT_PUBLIC_BASE_PATH=/rotirumah-web
NEXT_PUBLIC_SITE_URL=https://sanzue.github.io/rotirumah-web
# opsional (T1+)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 7.2 Workflow

`.github/workflows/deploy.yml` — job: `npm ci` → `npm run typecheck` → `npm run build` → `touch out/.nojekyll`
→ `actions/upload-pages-artifact` → `actions/deploy-pages`. Permission `pages: write`, `id-token: write`,
`contents: read`; `concurrency: group: pages`. Trigger: push ke `main` (+ `workflow_dispatch`, dan branch kerja
selama uji — lihat §7.3).

`package.json` ditambah: `typecheck`, `export`, `images:optimize`, `verify` (build + cek `.nojekyll` + cek
`sitemap.xml` ada).

### 7.3 Hambatan yang harus diselesaikan lebih dulu

| Hambatan | Fakta | Rencana |
| --- | --- | --- |
| Pages masih `legacy` dari `main` | yang tayang README | ubah ke `build_type: workflow` via `gh api -X PUT .../pages` (token punya akses admin) |
| Environment `github-pages` hanya mengizinkan branch `main` | dicek via API | deploy pertama dari `main` setelah PR di-merge. Alternatif: tambahkan branch kerja ke branch policy (mengubah setting repo) supaya bisa lihat hasil sebelum merge |
| `.nojekyll` | `_next/` akan diabaikan Jekyll | dibuat otomatis di workflow |
| `basePath` | project site di `/rotirumah-web/` | dibaca dari env |
| Repo About masih menunjuk vercel.app | membingungkan | update setelah Pages hidup |

**Alur yang saya usulkan:** push branch kerja → buka PR → **kamu merge** → Actions build & deploy → cek
`https://sanzue.github.io/rotirumah-web/`. Kalau kamu ingin melihat sebelum merge, saya minta izin menambah
branch `arena/f64c144f-rotirumah-web` ke deployment branch policy.

---

## 8. Roadmap (urutan eksekusi)

| Fase | Isi | Hasil yang bisa dilihat | Estimasi |
| --- | --- | --- | --- |
| **0. Fondasi deploy** | `output:'export'`, `basePath`, `trailingSlash`, `.nojekyll`, workflow, skrip npm, ubah Pages ke workflow | situs Next benar-benar tayang di Pages (masih tampilan lama) | 45–60 mnt |
| **1. Performa & aset** | `Picture`, pipeline sharp, hero `<picture>` + preload, LQIP, hapus dead CSS, cache `Intl`, decode/lazy | hero muncul < 1 s, tidak ada request Unsplash | 2–3 jam |
| **2. Motion system** | token, reveal, hover/press, badge pop, cart drawer + toast, skeleton, header scroll | situs terasa hidup & halus, 0 KB library | 3–4 jam |
| **3. A11y & UX** | palet kontras, drawer lengkap (focus/ESC/inert), tab filter berfungsi, empty/hydration state, target 44 px, form | Lighthouse a11y 100 | 2–3 jam |
| **4. SEO & konten** | metadata per halaman, OG image, icon, sitemap/robots/manifest, JSON-LD, copywriting | shareable link + terindeks rapi | 1–2 jam |
| **5. Checkout T0** | pickup/ongkir, tanggal + slot, catatan, kode pesanan, validasi, draft tersimpan (§Lampiran B) | pesanan lengkap masuk WhatsApp; ongkir tidak lagi dipaksakan | 2–3 jam |
| **6. QA & rilis** | typecheck, CI, uji keyboard/mobile, Lighthouse manual, PR + merge, verifikasi live | rilis v1 | 1–2 jam |

Catatan: Fase 0–5 = lingkup iterasi ini (deploy, animasi, optimalisasi, efisiensi, checkout).
Backend T1–T2 (Supabase: katalog dari DB, order tersimpan, admin) **masuk backlog** — skemanya sudah siap di §5
kalau nanti dibutuhkan.

---

## 9. Peta perubahan file

| File | Aksi |
| --- | --- |
| `next.config.mjs` | tambah export/basePath/trailingSlash/images |
| `package.json` | skrip `typecheck`, `images:optimize`, `verify`; cabut `tailwindcss`, `@tailwindcss/postcss`, `postcss` |
| `postcss.config.mjs` | **dihapus** (Tailwind dicabut) |

| `app/layout.tsx` | metadata lengkap, viewport, icon, font, `<main tabIndex={-1}>`, CartDrawer + Toast |
| `app/page.tsx` | hero `<Picture priority>`, hero entrance, reveal grid |
| `app/menu/page.tsx` | `FilterTabs` nyata + `?kategori=` |
| `app/menu/[slug]/page.tsx` | `<Picture>`, JSON-LD Product, breadcrumb |
| `app/keranjang/page.tsx` | pecah: shell server + `CartView` client (fix flash hidrasi) |
| `app/kontak/page.tsx` | pecah: shell server + `ContactForm` client (validasi) |
| `app/paket, tentang-kami, testimoni` | `<Picture>`, reveal, copy rapi |
| `app/loading.tsx` | hapus (tidak dipakai di export) |
| `app/error.tsx`, `not-found.tsx` | sesuaikan gaya + `error` prop dicatat |
| `app/globals.css` | pecah ke `styles/*` dengan `@layer` |
| `components/Header, MobileNav, CartBadge` | drawer, focus trap, badge animasi, indikator mobile |
| `components/ProductCard, ProductDetailClient` | `<Picture>`, reveal, stepper 44 px, toast, bersihkan timer |
| `components/CartProvider` | `useReducer` + context terpisah + multi-tab + skema versi |
| `lib/data.ts` | pecah ke `lib/content/*`, tambah `slug` paket, config ongkir/pickup/jam |
| `lib/contact.ts` | template pesan order & kontak |
| **Baru** `components/{Picture,Reveal,CartDrawer,Toast,Skeleton,QuantityStepper,FilterTabs}.tsx` | — |
| **Baru** `lib/{format,cart/store,images.generated,seo}.ts`, `lib/content/*` | — |
| **Baru** `app/{sitemap,robots,manifest}.ts`, `app/icon.svg`, `app/opengraph-image.*` | — |
| **Baru** `scripts/optimize-images.mjs`, `assets/img-src/*`, `public/img/*` | — |
| **Baru** `.github/workflows/deploy.yml`, `.env.example` (isi) | — |
| **Baru** `README.md` | cara dev, build, deploy, cara ganti gambar |

---

## 10. Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| `build_type` tidak bisa diubah via API | Pages tetap README | fallback: branch `gh-pages` hasil export + ubah source via API; atau deploy dari `main` saja |
| Branch policy menolak deploy non-`main` | tidak bisa lihat sebelum merge | merge PR dulu, atau tambah branch ke policy (izin) |
| Lupa `.nojekyll` | situs tanpa CSS/JS | dibuat di workflow + `npm run verify` |
| `basePath` salah saat dev | link 404 saat `npm run dev` | default `''` di dev, hanya di-set di CI |
| Gambar remote tetap dipakai | LCP tidak stabil | pipeline lokal, cek jumlah request pihak ketiga = 0 |
| Animasi berlebihan | terasa lambat, INP naik | semua transform/opacity, tanpa library, uji `prefers-reduced-motion` |
| Supabase dipasang terlalu dini | kompleks, situs bisa rusak | feature-flag `NEXT_PUBLIC_SUPABASE_URL` kosong = fitur mati, fallback WhatsApp |
| Harga dikirim dari klien | manipulasi | RPC re-pricing server-side |
| Key rahasia bocor ke bundle | fatal | hanya anon key; service key di Edge Function |
| Pages tidak punya header cache kustom | aset di-revalidate | nama file ber-hash; opsional Cloudflare di depan |

---

## 11. Definition of done (v1)

- [ ] `https://sanzue.github.io/rotirumah-web/` menampilkan aplikasi (bukan README), semua 7 halaman + 9 detail produk jalan.
- [ ] `output:'export'`, `trailingSlash`, `basePath` benar; `.nojekyll`, `404.html`, `sitemap.xml`, `robots.txt`, `manifest.webmanifest` tersaji.
- [ ] 0 request ke `images.unsplash.com`; semua gambar dari `public/img/`, hero AVIF + `fetchpriority=high` + preload.
- [ ] First-load JS ≤ 130 KB gzip; CSS ≤ 4,5 KB gzip.
- [ ] Tailwind benar-benar hilang: tidak ada `@import "tailwindcss"`, `postcss.config.mjs` terhapus, build tetap hijau tanpa 3 devDependency itu.
- [ ] Reveal, hover, drawer, toast jalan; `prefers-reduced-motion: reduce` mematikan semuanya.
- [ ] Tidak ada flash "keranjang kosong"; badge keranjang terlihat di mobile.
- [ ] Kontras ≥ 4,5:1 untuk semua teks; satu `<h1>` per halaman; navigasi keyboard penuh (termasuk drawer).
- [ ] `npm run build` & `npm run typecheck` hijau di CI; artefak deploy = folder `out/`.
- [ ] Checkout T0 membawa nama, WA, pickup/delivery, tanggal, slot, catatan, kode pesanan; pickup = Rp0.
- [ ] Deploy jalan dari branch kerja (preview) **dan** dari `main` (rilis).
- [ ] README diperbarui (dev, build, deploy, ganti gambar).

---

## 12. Keputusan (final) & langkah pertama di mode action

Semua terjawab di §0.1. Urutan eksekusi yang akan saya tempuh persis setelah kamu bilang "mulai":

1. **Canary deploy** (paling berisiko, dikerjakan lebih dulu): ubah `build_type` Pages → `workflow`,
   tambahkan branch kerja ke deployment branch policy, push workflow, pastikan halaman live berubah dari README
   menjadi aplikasi. Kalau salah satu langkah API ditolak, saya laporkan dan pakai jalur `main` saja.
2. Fondasi build: `output:'export'`, `basePath`, `trailingSlash`, `.nojekyll`, skrip npm, cabut Tailwind.
3. Aset: generate 15 foto + OG, jalankan `sharp`, `Picture`, hero jadi gambar asli (bukan CSS background).
4. Motion: token → reveal → micro-interaction → drawer/toast/skeleton.
5. A11y, SEO, T0 checkout, QA, PR.

Yang **tidak** akan saya sentuh tanpa izin lagi: mengubah setting repo di luar Pages/branch policy,
menambah layanan eksternal (Supabase/analytics), atau memindahkan project dari Next.js.

---

## Lampiran A — Cara mengukur ulang (untuk QA)

```bash
npm ci
npm run typecheck
npm run build
python3 -c"import gzip,glob;print(sum(len(gzip.compress(open(f,'rb').read(),9))for f in glob.glob('.next/static/chunks/*.js'))/1024,'KB gzip JS')"
# ukuran HTML per halaman
ls -l out/index.html out/menu/index.html
```

Angka pada dokumen ini diukur dari build `c459dea` di sandbox (Next 16.3.5, Node 22.22.3). Sandbox tidak punya
Chrome, jadi **skor Lighthouse/LCP/CLS final harus kamu ambil di Chrome DevTools lokal** — angka target di §6
adalah target, bukan hasil pengukuran.

---

## Lampiran B — Spesifikasi checkout T0 (WhatsApp yang "naik kelas")

Ini inti keputusan "backend T0": pesanan tetap lewat WhatsApp, tapi datanya lengkap dan valid, sehingga
kamu bisa memproses tanpa tanya balik.

### B.1 Konfigurasi (`lib/content/site.ts`)

```ts
export const site = {
  name: 'RotiRumah',
  whatsappDisplay: '0896-0609-1861',
  whatsappE164: '6289606091861',
  instagram: { handle: '@bundaihza01', url: 'https://instagram.com/bundaihza01' },
  hours: '07.00–20.00 WIB',
  timeZone: 'Asia/Jakarta',
  fulfilment: {
    pickup:   { label: 'Ambil di dapur', fee: 0 },
    delivery: { label: 'Diantar',        fee: 10_000, minSubtotal: 50_000 },
  },
  slots: ['07.00–10.00', '10.00–13.00', '13.00–16.00', '16.00–19.00'],
  preOrder: { minDays: 1, maxDays: 14 },
  limits: { maxQtyPerItem: 20, maxItems: 60 },
} as const;
```

Ongkir tidak lagi hardcoded di halaman: `pickup` = Rp0, `delivery` = Rp10.000 (dan minimal belanja
Rp50.000 untuk diantar). Semua angka ada di satu tempat.

### B.2 Aturan validasi

| Field | Aturan | Pesan error |
| --- | --- | --- |
| `name` | 2–60 karakter | "Nama minimal 2 karakter." |
| `phone` | `^(\+62\|62\|0)8[1-9][0-9]{6,11}$` → dinormalisasi ke `62…` | "Nomor WhatsApp belum valid (contoh: 0896…)." |
| `fulfilment` | `pickup` \| `delivery` | — |
| `address` | wajib 10–200 karakter jika `delivery` | "Alamat wajib diisi untuk pengantaran." |
| `date` | `YYYY-MM-DD`, ≥ besok, ≤ H+14 (zona `Asia/Jakarta`) | "Pilih tanggal mulai besok, maksimal 2 minggu ke depan." |
| `slot` | salah satu dari `site.slots` | "Pilih jam ambil/kirim." |
| `note` | ≤ 300 karakter | "Catatan maksimal 300 karakter." |
| item | qty 1–20 per item, total ≤ 60 | "Jumlah per produk maksimal 20." |

Validasi dijalankan di klien (untuk UX) **dan** dicek ulang saat menyusun pesan. Karena tidak ada server,
validasi ini bukan garis keamanan — itu diterima di T0 karena "pembayaran" tetap manual lewat obrolan.

### B.3 Kode pesanan & template pesan

Kode dibuat lokal: `RR-<YYYYMMDD>-<4 karakter base32>` (mis. `RR-20261028-A7K2`) memakai `crypto.getRandomValues`,
bukan `Math.random()`. Kode ini ditampilkan di ringkasan dan dikutip di WhatsApp agar mudah dicari.

```
Halo RotiRumah 👋
Saya ingin memesan (kode: RR-20261028-A7K2)

Nama: Siti Rahayu
WhatsApp: 0896-0609-1861
Metode: Diantar
Tanggal: Rabu, 28 Oktober 2026
Slot: 10.00–13.00
Alamat: Jl. Cigadung Raya No. 12, Bandung

Rincian:
• Roti Bolen Keju (Keju) ×2 — Rp30.000
• Donat Bomboloni (Cokelat) ×1 — Rp12.000

Subtotal: Rp42.000
Ongkir: Rp10.000
Total: Rp52.000

Catatan: tanpa kacang
Mohon dikonfirmasi ketersediaannya. Terima kasih!
```

- Tanggal diformat `Intl.DateTimeFormat('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'Asia/Jakarta' })` (formatter di-cache).
- Draft disimpan di `rotirumah-checkout-draft-v1` agar tidak hilang saat refresh; dihapus setelah terkirim.
- Kalau `window.open` diblokir (popup blocker), tampilkan panel fallback: teks pesan + tombol "Salin pesan"
  (`navigator.clipboard`) + tautan `wa.me` biasa.

### B.4 Di luar cakupan T0 (sengaja)

Stok real-time, nomor pesanan tersimpan, pembayaran otomatis, notifikasi ke kamu. Semua itu butuh T1–T2 (§5).

---

## Lampiran C — Kontrak motion (siap ditulis di Fase 2)

### C.1 CSS (`styles/motion.css`)

```css
@layer motion {
  :root {
    --dur-1: 120ms; --dur-2: 180ms; --dur-3: 280ms; --dur-4: 420ms;
    --ease-out: cubic-bezier(.22,.61,.36,1);
    --ease-spring: cubic-bezier(.34,1.4,.64,1);
  }

  /* konten TETAP terlihat kalau JS mati; kelas .js dipasang skrip inline di <head> */
  .js .reveal:not([data-shown]) {
    opacity: 0;
    transform: translate3d(0, 14px, 0);
  }
  .reveal {
    transition: opacity var(--dur-3) var(--ease-out),
                transform var(--dur-3) var(--ease-out);
    transition-delay: calc(var(--i, 0) * 45ms);
  }

  @keyframes pop { 0% { transform: scale(.7) } 60% { transform: scale(1.15) } 100% { transform: scale(1) } }
  @keyframes rise { from { opacity: 0; transform: translate3d(0, 18px, 0) } to { opacity: 1; transform: none } }
}

@media (prefers-reduced-motion: reduce) {
  .js .reveal:not([data-shown]) { opacity: 1; transform: none; }
  .reveal { transition: none; transition-delay: 0s; }
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### C.2 `Reveal.tsx`

```tsx
<Reveal as="article" delay={index}>…</Reveal>
```

- **Satu** `IntersectionObserver` tingkat modul (dibuat malas), `Map<Element, () => void>`; `unobserve` setelah tampil.
- Tidak memakai `useState` per item: saat masuk viewport, langsung `node.setAttribute('data-shown', 'true')`
  → nol re-render React untuk 9–15 kartu.
- `prefers-reduced-motion: reduce` → set `data-shown` segera, observer tidak pernah dibuat.
- Tanpa JS → kelas `.js` tidak pernah dipasang → konten langsung terlihat (tidak ada halaman kosong).
- `delay` dibatasi 0–5 (maks 225 ms) supaya item ke-20 tidak menunggu 1 detik.

### C.3 Checklist drawer keranjang

- Buka dari badge/header dan setelah "Tambah ke keranjang" (opsional; default: toast, bukan drawer, agar tidak memotong alur).
- `role="dialog" aria-modal="true" aria-labelledby`, fokus pindah ke tombol tutup saat buka.
- Escape, klik backdrop, tombol tutup → tutup; fokus kembali ke elemen pemicu.
- `Tab`/`Shift+Tab` terkurung di dalam drawer; konten belakang `inert`.
- Scroll body dikunci **tanpa** menggeser layout (`scrollbar-gutter: stable`).
- Animasi 280 ms; kalau `prefers-reduced-motion`, muncul tanpa animasi.

---

## Lampiran D — Deployment

### D.1 `.github/workflows/deploy.yml`

```yaml
name: Deploy ke GitHub Pages

on:
  push:
    branches: [main, arena/f64c144f-rotirumah-web]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      NEXT_TELEMETRY_DISABLED: '1'
      NEXT_PUBLIC_BASE_PATH: /rotirumah-web
      NEXT_PUBLIC_SITE_URL: https://sanzue.github.io/rotirumah-web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build
      - name: Verifikasi artefak
        run: |
          touch out/.nojekyll
          test -f out/index.html
          test -f out/404.html
          test -f out/sitemap.xml
          test -f out/robots.txt
          test -f out/manifest.webmanifest
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

Versi action akan saya cek ulang saat eksekusi (kalau ada major baru, pakai yang resmi terbaru).

### D.2 Perubahan setting repo (butuh izinmu, sekali saja)

```bash
# 1) Pages: legacy (Jekyll dari main) -> workflow
gh api -X PUT repos/SanZUE/rotirumah-web/pages -f build_type=workflow

# 2) izinkan branch kerja ikut deploy (preview sebelum merge)
gh api -X POST repos/SanZUE/rotirumah-web/environments/github-pages/deployment-branch-policies \
  -f name='arena/f64c144f-rotirumah-web' -f type=branch

# 3) bukti
gh api repos/SanZUE/rotirumah-web/pages
```

Kalau (1) atau (2) ditolak, jalur cadangan: merge PR ke `main` lebih dulu, deploy hanya dari `main`.

### D.3 Verifikasi pasca-deploy

| Cek | Cara |
| --- | --- |
| Bukan README lagi | buka `/rotirumah-web/`, harus ada hero + menu |
| CSS/JS termuat | DevTools → Network, tidak ada 404 untuk `/_next/` |
| Sub-halaman | `/rotirumah-web/menu/`, `/rotirumah-web/menu/bolen-keju/` |
| 404 | buka URL ngawur → halaman 404 kustom, bukan 404 GitHub |
| Tanpa pihak ketiga | filter Network by domain → hanya `sanzue.github.io` |
| Meta | `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` balik 200 |

---

## Lampiran E — Skrip QA yang akan dibuat

```jsonc
// package.json (tambahan)
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "images:optimize": "node scripts/optimize-images.mjs",
    "size:report": "node scripts/report-size.mjs",
    "verify": "npm run typecheck && npm run build && npm run size:report"
  }
}
```

`scripts/report-size.mjs` membaca `out/`, merge semua `<script src>` + `<link rel=stylesheet>` per halaman,
menghitung gzip, lalu mencetak tabel:

```
Halaman              JS gz     CSS gz    HTML gz
/                    118.4 KB   4.1 KB     4.2 KB
/menu/               118.4 KB   4.1 KB     4.3 KB
/menu/bolen-keju/    119.0 KB   4.1 KB     4.0 KB
```

dan **gagal** (`exit 1`) kalau JS > 130 KB gzip atau CSS > 4,5 KB gzip — supaya regresi performa ketahuan
di CI, bukan setelah deploy.

---

## 13. Hasil implementasi (27 Oktober 2026)

Status: Fase 0–5 sebagian besar **selesai dan terverifikasi build**, menunggu deploy.

### 13.1 Yang sudah jalan

| Area | Bukti |
| --- | --- |
| Static export untuk GitHub Pages | `output:'export'`, `basePath` dari `NEXT_PUBLIC_BASE_PATH`, `trailingSlash`, `images.unoptimized` |
| Artefak lengkap | 21 halaman statis + `404.html`, `sitemap.xml` (17 URL), `robots.txt`, `manifest.webmanifest`, `icon.svg`, `og.jpg`, `out/.nojekyll` |
| Workflow CI | `.github/workflows/deploy.yml` — typecheck → build → verifikasi artefak → laporan ukuran → upload → deploy. Job **build sukses** di run pertama |
| Tailwind | dicabut: `postcss.config.mjs` dihapus, 3 devDependency hilang, CSS diganti 5 layer di `styles/` |
| Gambar | 10 foto lokal (sharp) → AVIF/WebP/JPG 2 lebar + 4 lebar untuk hero; LQIP base64; **0 request pihak ketiga** |
| Hero LCP | `<picture>` + `preload` AVIF di `<head>` (lewat `react-dom preload`) + `fetchpriority=high`. AVIF 1080 = **41,5 KB** |
| Motion | token durasi/easing, scroll reveal (1 observer, tanpa state), hero entrance, hover kartu, badge pop, drawer + backdrop, toast, skeleton — semua `transform`/`opacity`, hormat `prefers-reduced-motion` (layar CSS + `media (scripting: enabled)`) |
| A11y | palet baru: `--accent #a05226` (5,42:1), `--muted #7a6a5f` (4,53:1 di band); satu `<h1>`/halaman; drawer `role=dialog` + focus trap + Escape; target sentuh 44 px; `aria-live` untuk qty & toast |
| SEO | metadata per halaman + canonical + OG/Twitter, JSON-LD `Bakery`/`Product`/`BreadcrumbList`, sitemap, robots, manifest, `theme-color` |
| Keranjang | `useReducer` + context terpisah (state vs actions), sinkron antar-tab, versi storage v2 dengan migrasi dari v1, badge keranjang **tampil di mobile** |
| Checkout T0 | pickup (gratis) vs delivery (Rp10.000, min Rp50.000), tanggal H+1…H+14, slot jam, alamat kondisional, catatan, kode pesanan `RR-YYYYMMDD-XXXX` (crypto), validasi + `role="alert"`, draft pesan + fallback popup-blocked |

### 13.2 Koreksi penting terhadap target di §6

Target "first-load JS ≤ 130 KB gzip" **tidak realistis**. Diukur dengan proyek Next 16
minimal (satu halaman kosong, `output:'export'`): **168,3 KB gzip** hanya untuk runtime
framework. Angka final:

| Metrik | Target awal | Hasil nyata |
| --- | --- | --- |
| JS total | ≤ 130 KB | 182,8 KB (tidak mungkin di bawah lantai framework) |
| **Kode aplikasi** (total − lantai) | — | **14,5 KB gzip** |
| CSS | ≤ 4,5 KB | 5,8 KB gzip (24 KB mentah) — lebih besar karena motion + komponen baru, masih di bawah anggaran 6,5 KB |
| Hero AVIF 1080 | ≤ 90 KB | **41,5 KB** |
| Request pihak ketiga | 0 | **0** |
| HTML/halaman | ~4,2 KB gzip | 4,4–8,0 KB gzip |

`npm run size:report` sekarang melaporkan *kode aplikasi* (total − lantai 168,3 KB) dan gagal
kalau melewati 18 KB, supaya regresi kode kita sendiri tetap terdeteksi.

### 13.3 Deviasi dari rencana

- **Filter kategori** memakai state klien + `history.replaceState` (`?kategori=`), bukan
  halaman statis per kategori. Semua produk tetap ada di HTML awal, jadi tidak ada kerugian SEO;
  keuntungannya nol halaman tambahan.
- **5 foto paket** (`paket-ngopi`, `paket-keluarga`, `paket-hampers`, `paket-spesial`,
  `paket-lebaran`) belum dibuat karena batas 10 gambar per turn. Sementara memakai foto
  yang sudah ada (ditandai `TODO` di `lib/content/bundles.ts`).
- **`loading.tsx` dihapus**, diganti skeleton di dalam `CartView` (karena export statis tidak
  memakai streaming).

### 13.4 Yang masih terbuka

1. Deploy: branch kerja ditolak environment `github-pages`
   (`Branch "…" is not allowed to deploy to github-pages due to environment protection rules.`).
   Perlu merge ke `main` atau menambah branch di Settings → Environments.
2. Pages `build_type` masih `legacy`; workflow sudah memakai `configure-pages` dengan
   `enablement: true` supaya bisa mengaktifkannya sendiri saat berjalan di branch yang diizinkan.
3. Lighthouse/LCP/CLS final harus diukur di Chrome (sandbox tidak punya browser).
4. Backend T1–T2 (Supabase) masih backlog sesuai keputusan.
