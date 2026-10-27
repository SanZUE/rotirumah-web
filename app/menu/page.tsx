import type { Metadata } from 'next';
import { MenuGrid } from '@/components/MenuGrid';
import { products } from '@/lib/content/products';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Menu Roti',
  description:
    'Daftar lengkap roti rumahan RotiRumah: bolen keju, bolen cokelat, bomboloni, roti sobek, roti keju, roti sosis, dan bolen durian musiman.',
  alternates: { canonical: '/menu/' },
  openGraph: {
    title: `Menu Roti · ${site.name}`,
    description: 'Pilih roti favoritmu, tentukan varian rasa dan jumlah, lalu pesan via WhatsApp.',
    url: '/menu/',
  },
};

export default function MenuPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Menu</div>
          <h1>Roti yang siap menemani hari.</h1>
          <p>
            Pilih produk favoritmu. Klik produk untuk memilih varian rasa dan jumlah sebelum masuk
            keranjang.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <MenuGrid products={products} />
        </div>
      </section>
    </main>
  );
}
