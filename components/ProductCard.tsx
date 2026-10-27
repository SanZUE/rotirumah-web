import Link from 'next/link';
import { Picture } from '@/components/Picture';
import { rupiah } from '@/lib/format';
import type { Product } from '@/lib/content/products';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card">
      <Link href={`/menu/${product.slug}`} tabIndex={-1} aria-hidden="true">
        <Picture
          slug={product.image}
          alt=""
          className="card-media"
          sizes="(max-width: 560px) 46vw, (max-width: 940px) 46vw, 270px"
        />
      </Link>
      <div className="card-body">
        <Link href={`/menu/${product.slug}`} className="card-title">
          {product.name}
        </Link>
        <div className="card-meta">
          {product.category} · Fresh setiap hari
        </div>
        <div className="card-footer">
          <span className="price">{rupiah(product.price)}</span>
          <Link href={`/menu/${product.slug}`} className="mini-btn" tabIndex={-1} aria-hidden="true">
            Lihat
          </Link>
        </div>
      </div>
    </article>
  );
}
