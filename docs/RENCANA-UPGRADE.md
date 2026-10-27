# Rencana Upgrade RotiRumah Web

**Status:** draft untuk disetujui · **Tanggal:** 27 Oktober 2026
**Basis kode:** `c459dea` (branch `arena/f64c144f-rotirumah-web`)
**Sasaran:** upgrade animasi + optimalisasi + efisiensi, hasil akhir tampil di **GitHub Pages**

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

**Sumber foto (butuh keputusanmu — lihat §12):** tiga opsi, semuanya bisa dikerjakan di sandbox ini:

| Opsi | Plus | Minus |
| --- | --- | --- |
| A. Tetap Unsplash (URL remote) | 0 pekerjaan | pihak ketiga, LCP tidak stabil, tidak ada srcset lokal |
| B. Foto asli RotiRumah (kamu upload) | paling kredibel & jujur | perlu kamu kirim file |
| C. Placeholder fotorealistis yang saya generate | tanpa dependensi, konsisten, bisa langsung jalan | harus diberi label ilustrasi sampai foto asli ada |

Rekomendasi saya: **C sekarang, B nanti**. Pipeline-nya identik; mengganti file sumber tidak mengubah kode.

### 4.4 Aksesibilitas

- Warna: `--accent` digelapkan ke **`#a05226`** (5,42:1 di cream, 4,92:1 di band) — masih terasa
  terracotta. `--muted` untuk area band → **`#7a6a5f`** (4,53:1). Simpan varian terang hanya untuk dekorasi.
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
| CSS | 4,3 KB gzip | ≤ 4,5 KB (dengan motion) | `@layer`, hapus kelas mati (`split`, `split-img`, `quote-box`), putuskan Tailwind |
| Request pihak ketiga | ~9–13 gambar Unsplash | **0** | gambar lokal hasil sharp |
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
| **5. Backend opsional** | T0 diperkaya (pickup/ongkir, tanggal, catatan) lalu T1–T2 Supabase + admin read-only | pesanan tercatat, katalog bisa diubah tanpa deploy | 3–6 jam per tier |
| **6. QA & rilis** | typecheck, build, uji keyboard/mobile, cek Lighthouse manual, PR + merge, verifikasi live | rilis v1 | 1–2 jam |

Catatan: Fase 0–4 = inti permintaan (animasi, optimalisasi, efisiensi). Fase 5 hanya dikerjakan kalau kamu setuju
menambah dependensi eksternal.

---

## 9. Peta perubahan file

| File | Aksi |
| --- | --- |
| `next.config.mjs` | tambah export/basePath/trailingSlash/images |
| `package.json` | skrip `typecheck`, `images:optimize`, `verify`; hapus/pertahankan Tailwind (§12) |
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
- [ ] 0 request ke `images.unsplash.com`; hero AVIF + `fetchpriority=high` + preload.
- [ ] First-load JS ≤ 130 KB gzip; CSS ≤ 4,5 KB gzip.
- [ ] Reveal, hover, drawer, toast jalan; `prefers-reduced-motion: reduce` mematikan semuanya.
- [ ] Tidak ada flash "keranjang kosong"; badge keranjang terlihat di mobile.
- [ ] Kontras ≥ 4,5:1 untuk semua teks; satu `<h1>` per halaman; navigasi keyboard penuh (termasuk drawer).
- [ ] `npm run build` & `npm run typecheck` hijau di CI; artefak deploy = folder `out/`.
- [ ] Checkout T0 membawa nama, WA, pickup/delivery, tanggal, catatan; pickup = Rp0.
- [ ] README diperbarui (dev, build, deploy, ganti gambar/font).

---

## 12. Keputusan yang saya butuhkan sebelum mode action

1. **Sumber foto** — pakai placeholder fotorealistis yang saya buat (cepat, tanpa dependensi), tetap Unsplash,
   atau kamu kirim foto asli?
2. **Tailwind** — dihapus (hemat dependensi & ~1,4 KB CSS, seluruh styling jadi CSS semantik) atau dipertahankan
   sebagai layer utilitas untuk komponen baru?
3. **Backend** — cukup T0 (checkout WhatsApp yang jauh lebih lengkap) dulu, atau langsung siapkan Supabase T1–T2
   di iterasi ini?
4. **Cara rilis** — merge PR ke `main` lalu deploy dari `main` (aman, standar), atau saya minta izin menambah
   branch kerja ke deployment branch policy supaya kamu bisa lihat hasil sebelum merge?

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
