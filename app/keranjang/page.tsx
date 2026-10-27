import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Keranjang',
  description:
    'Periksa pesanan roti rumahanmu, pilih pickup atau delivery, tentukan tanggal, lalu kirim pesanan lewat WhatsApp.',
  alternates: { canonical: '/keranjang/' },
  robots: { index: false, follow: true },
  openGraph: {
    title: `Keranjang · ${site.name}`,
    description: 'Ringkasan pesanan dan checkout via WhatsApp.',
    url: '/keranjang/',
  },
};

export default function CartPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Order</div>
          <h1>Keranjang belanja</h1>
          <p>
            Lengkapi detail pesanan, pilih ambil sendiri atau diantar, lalu kirim lewat WhatsApp
            untuk dikonfirmasi dapur.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <CartView />
        </div>
      </section>
    </main>
  );
}
