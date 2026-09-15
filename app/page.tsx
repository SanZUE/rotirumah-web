import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { products, bundles } from '@/lib/data';

export default function HomePage() {
  const bestSellers = products.slice(0, 4);
  return (
    <main>
      <section className="hero section"><div className="container"><div className="hero-card"><div className="hero-content"><div className="eyebrow" style={{ color: '#ffd0b2' }}>Fresh dari dapur rumah</div><h1>Roti rumahan, rasa istimewa.</h1><p>Dibuat fresh setiap hari untuk sarapan, teman ngopi, hadiah, dan momen bersama orang-orang terdekat.</p><div className="hero-actions"><Link href="/menu" className="btn btn-light">Lihat Menu</Link><Link href="/paket" className="btn btn-outline">Lihat Paket</Link></div></div></div><div className="feature-row"><div className="feature"><strong>Fresh setiap hari</strong><span>Dibuat sesuai kapasitas produksi agar rasa tetap terjaga.</span></div><div className="feature"><strong>Pre-order</strong><span>Untuk kebutuhan acara dan jumlah besar, pesan lebih awal.</span></div><div className="feature"><strong>Pickup & delivery</strong><span>Area pengantaran menyesuaikan jangkauan dapur.</span></div></div></div></section>
      <section className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">Best seller</div><h2>Favorit pelanggan</h2><p>Produk andalan yang cocok untuk dinikmati sendiri atau dibagikan.</p></div><Link className="link-more" href="/menu">Lihat semua →</Link></div><div className="grid-4">{bestSellers.map((product) => <ProductCard key={product.slug} product={product} />)}</div></div></section>
      <section className="band section"><div className="container"><div className="section-head"><div><div className="eyebrow">Bundling</div><h2>Paket untuk momen spesial</h2><p>Pilih paket yang sudah dirancang untuk ngopi, keluarga, atau hadiah.</p></div><Link className="btn btn-brown" href="/paket">Lihat Paket</Link></div><div className="grid-3">{bundles.slice(0,3).map((bundle) => <article key={bundle.name} className="card"><img className="card-image" src={bundle.image} alt={bundle.name}/><div className="card-body"><div className="card-title">{bundle.name}</div><div className="card-meta">{bundle.desc}</div><div className="card-footer"><span className="price">Rp{bundle.price.toLocaleString('id-ID')}</span><Link className="mini-btn" href="/paket">Lihat</Link></div></div></article>)}</div></div></section>
    </main>
  );
}
