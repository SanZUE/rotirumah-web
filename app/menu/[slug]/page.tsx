import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Picture } from '@/components/Picture';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { Reveal } from '@/components/Reveal';
import { getProduct, getRelatedProducts, products } from '@/lib/content/products';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo';
import { truncate } from '@/lib/format';
import { site } from '@/lib/content/site';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: 'Produk tidak ditemukan' };

  return {
    title: product.name,
    description: truncate(product.description, 155),
    alternates: { canonical: `/menu/${product.slug}/` },
    openGraph: {
      type: 'article',
      title: `${product.name} · ${site.name}`,
      description: product.description,
      url: `/menu/${product.slug}/`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product.slug, 3);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Beranda', path: '/' },
              { name: 'Menu', path: '/menu/' },
              { name: product.name, path: `/menu/${product.slug}/` },
            ]),
          ),
        }}
      />

      <section className="section">
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ marginBottom: 18, fontSize: 13, color: 'var(--muted)' }}>
            <Link href="/">Beranda</Link> / <Link href="/menu">Menu</Link> /{' '}
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="detail">
            <Picture
              slug={product.image}
              alt={product.imageAlt}
              className="detail-media"
              sizes="(max-width: 940px) 100vw, 560px"
              priority
            />
            <div>
              <ProductDetailClient product={product} />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 15 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Rekomendasi</div>
              <h2>Kamu mungkin juga suka</h2>
            </div>
          </div>

          <div className="grid-3">
            {related.map((entry, index) => (
              <Reveal key={entry.slug} delay={index}>
                <ProductCard product={entry} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
