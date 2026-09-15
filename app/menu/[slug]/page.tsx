import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailClient } from '@/components/ProductDetailClient';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((entry) => entry.slug === slug);
  if (!product) notFound();

  const related = products.filter((entry) => entry.slug !== product.slug).slice(0, 3);

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="detail">
            <img className="detail-image" src={product.image} alt={product.name} />
            <div>
              <ProductDetailClient product={product} />
              <Link href="/menu" className="link-more" style={{ display: 'inline-block', marginTop: 16 }}>← Kembali ke menu</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 15 }}>
        <div className="container">
          <div className="section-head"><div><div className="eyebrow">Rekomendasi</div><h2>Kamu mungkin juga suka</h2></div></div>
          <div className="grid-3">{related.map((entry) => <ProductCard key={entry.slug} product={entry} />)}</div>
        </div>
      </section>
    </main>
  );
}
