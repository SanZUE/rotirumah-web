import { products } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';

export default function MenuPage() {
  return (
    <main>
      <section className="page-hero"><div className="container"><div className="eyebrow">Menu</div><h1>Roti yang siap menemani hari.</h1><p>Pilih produk favoritmu. Klik produk untuk memilih varian rasa dan jumlah sebelum masuk keranjang.</p></div></section>
      <section className="section" style={{ paddingTop: 20 }}><div className="container"><div className="tabs"><Link className="tab active" href="/menu">Semua</Link><span className="tab">Andalan</span><span className="tab">Reguler</span><span className="tab">Musiman</span></div><div className="grid-4">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div></div></section>
    </main>
  );
}
