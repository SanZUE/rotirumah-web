import Link from 'next/link';
import type { Metadata } from 'next';
import { Picture } from '@/components/Picture';
import { Reveal } from '@/components/Reveal';
import { BundleAddButton } from '@/components/BundleAddButton';
import { bundles } from '@/lib/content/bundles';
import { rupiah } from '@/lib/format';
import { bundleJsonLd } from '@/lib/seo';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Paket & Bundling',
  description:
    'Paket roti RotiRumah untuk ngopi, keluarga, hampers, dan acara: Paket Ngopi, Paket Keluarga, Paket Hampers, Paket Spesial, dan Paket Lebaran.',
  alternates: { canonical: '/paket/' },
  openGraph: {
    title: `Paket & Bundling · ${site.name}`,
    description: 'Lebih hemat, lebih lengkap, lebih enak untuk dibagikan.',
    url: '/paket/',
  },
};

export default function PaketPage() {
  return (
    <main>
      {bundles.map((bundle) => (
        <script
          key={bundle.slug}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bundleJsonLd(bundle)) }}
        />
      ))}

      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Bundling</div>
          <h1>Paket spesial</h1>
          <p>
            Lebih hemat, lebih lengkap, lebih enak untuk dibagikan. Paket juga jadi jalur termudah
            kalau kamu ingin memesan untuk acara.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container bundles">
          {bundles.map((bundle, index) => (
            <Reveal key={bundle.slug} delay={index} as="article" className="bundle">
              <Picture
                slug={bundle.image}
                alt={bundle.imageAlt}
                className="bundle-media"
                sizes="(max-width: 560px) 100vw, 280px"
              />
              <div className="bundle-body">
                {bundle.badge ? (
                  <span className="badge" style={{ alignSelf: 'flex-start' }}>
                    {bundle.badge}
                  </span>
                ) : null}
                <h3>{bundle.name}</h3>
                <p>{bundle.description}</p>
                <ul style={{ display: 'grid', gap: 4, fontSize: 13, color: 'var(--muted)' }}>
                  {bundle.contents.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
                <div className="price-lg" style={{ fontSize: 20 }}>
                  {rupiah(bundle.price)}
                </div>
                <BundleAddButton bundle={bundle} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Custom order</div>
              <h2>Punya kebutuhan khusus?</h2>
              <p>
                Untuk ulang tahun, pengajian, kantor, hampers, atau acara keluarga, paket dapat
                disesuaikan. Beri tahu jumlah dan tanggal acara, kami bantu susun.
              </p>
            </div>
            <Link href="/kontak" className="btn btn-brown">
              Tanya via WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
