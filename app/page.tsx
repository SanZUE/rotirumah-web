import Link from 'next/link';
import type { Metadata } from 'next';
import { Picture } from '@/components/Picture';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { featuredProducts } from '@/lib/content/products';
import { bundles } from '@/lib/content/bundles';
import { rupiah } from '@/lib/format';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  description: site.description,
  alternates: { canonical: '/' },
};

const features = [
  {
    title: 'Fresh setiap hari',
    text: 'Dibuat sesuai kapasitas produksi agar rasa dan tekstur tetap terjaga.',
  },
  {
    title: 'Pre-order',
    text: 'Untuk acara dan jumlah besar, pesan minimal sehari sebelumnya.',
  },
  {
    title: 'Pickup & delivery',
    text: 'Ambil langsung di dapur (gratis) atau minta diantar sesuai jangkauan.',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-card">
            <Picture
              slug="hero"
              alt="Aneka roti rumahan hangat: bolen, roti sobek, dan bomboloni di atas meja kayu"
              className="hero-media"
              sizes="(max-width: 1160px) 100vw, 1160px"
              priority
              ratio={16 / 9}
            />
            <div className="hero-content hero-enter">
              <div className="eyebrow" style={{ color: '#ffd0b2' }}>
                Fresh dari dapur rumah
              </div>
              <h1>Roti rumahan, rasa istimewa.</h1>
              <p>
                Dibuat fresh setiap hari untuk sarapan, teman ngopi, hadiah, dan momen bersama
                orang-orang terdekat.
              </p>
              <div className="hero-actions">
                <Link href="/menu" className="btn btn-light">
                  Lihat Menu
                </Link>
                <Link href="/paket" className="btn btn-outline">
                  Lihat Paket
                </Link>
              </div>
            </div>
          </div>

          <div className="feature-row">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index} className="feature">
                <strong>{feature.title}</strong>
                <span>{feature.text}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Best seller</div>
              <h2>Favorit pelanggan</h2>
              <p>Produk andalan yang cocok untuk dinikmati sendiri atau dibagikan.</p>
            </div>
            <Link className="link-more" href="/menu" prefetch={false}>
              Lihat semua →
            </Link>
          </div>

          <div className="grid-4">
            {featuredProducts.map((product, index) => (
              <Reveal key={product.slug} delay={index}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Bundling</div>
              <h2>Paket untuk momen spesial</h2>
              <p>Pilih paket yang sudah dirancang untuk ngopi, keluarga, atau hadiah.</p>
            </div>
            <Link className="btn btn-brown" href="/paket" prefetch={false}>
              Lihat Paket
            </Link>
          </div>

          <div className="grid-3">
            {bundles.slice(0, 3).map((bundle, index) => (
              <Reveal key={bundle.slug} delay={index}>
                <article className="card">
                  <Picture
                    slug={bundle.image}
                    alt={bundle.imageAlt}
                    className="card-media"
                    sizes="(max-width: 560px) 100vw, (max-width: 940px) 50vw, 360px"
                  />
                  <div className="card-body">
                    <div className="card-title">{bundle.name}</div>
                    <div className="card-meta">{bundle.description}</div>
                    <div className="card-footer">
                      <span className="price">{rupiah(bundle.price)}</span>
                      <Link href="/paket" className="mini-btn" prefetch={false}>
                        Lihat
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
