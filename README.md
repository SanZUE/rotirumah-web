# RotiRumah Web Prototype

Prototype awal website toko roti rumahan RotiRumah. Project ini dibuat agar mudah dipelajari dan dikembangkan bertahap.

## Stack
- Next.js App Router + React + TypeScript
- Tailwind CSS
- Target deployment: Vercel
- Target database: Neon PostgreSQL

## Yang sudah diperbaiki
- Root layout sudah memakai `<html>` dan `<body>` yang diwajibkan Next.js.
- Ditambahkan halaman loading, error, dan 404.
- Ditambahkan `.gitignore` agar dependency, build, dan secret tidak ikut Git.
- Ditambahkan `.env.example` sebagai contoh variabel database tanpa menyimpan password.
- Ditambahkan aksesibilitas dasar: bahasa halaman, skip link, dan focus state.

## Jalankan lokal
Pastikan terminal berada di folder yang berisi `package.json`.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Struktur
```text
app/
  page.tsx
  layout.tsx
  loading.tsx
  error.tsx
  not-found.tsx
  menu/page.tsx
  menu/[slug]/page.tsx
  paket/page.tsx
  tentang-kami/page.tsx
  testimoni/page.tsx
  keranjang/page.tsx
  kontak/page.tsx
components/
  Header.tsx
  Footer.tsx
  ProductCard.tsx
lib/
  data.ts
public/
```

## Catatan penting
Data produk masih hardcoded di `lib/data.ts`. Database belum dipasang. Jangan membuat file `.env.local` atau memasukkan `DATABASE_URL` ke GitHub sebelum tahap database.

## Setelah website lokal berhasil
1. Jalankan `npm run build`.
2. Simpan project ke Git/GitHub.
3. Deploy ke Vercel.
4. Baru lanjut ke Neon PostgreSQL.

## Diagnosis pemula
Kalau error muncul, selalu mulai dari tiga pertanyaan:
1. File mana yang berubah?
2. Data datang dari mana?
3. Apa pesan error pertama yang asli?
