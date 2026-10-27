'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import {
  categories,
  filterProducts,
  type CategoryFilter,
  type Product,
} from '@/lib/content/products';

/**
 * Grid menu dengan filter kategori.
 * - HTML awal (dari server) berisi semua produk → tetap ramah SEO & tanpa JS.
 * - Filter berjalan di klien; pilihan disimpan ke URL (?kategori=) lewat
 *   history.replaceState agar bisa dibagikan tanpa memicu navigasi Next.
 */
export function MenuGrid({ products }: { products: Product[] }) {
  const [active, setActive] = useState<CategoryFilter>('Semua');

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('kategori');
    if (fromUrl && (categories as readonly string[]).includes(fromUrl)) {
      setActive(fromUrl as CategoryFilter);
    }
  }, []);

  const visible = useMemo(() => {
    const source = filterProducts(active);
    // Pakai data yang dikirim server bila kategorinya "Semua" (identitas sama).
    return active === 'Semua' ? products : source;
  }, [active, products]);

  function select(category: CategoryFilter) {
    setActive(category);
    const url = new URL(window.location.href);
    if (category === 'Semua') url.searchParams.delete('kategori');
    else url.searchParams.set('kategori', category);
    window.history.replaceState(null, '', url);
  }

  return (
    <>
      <div className="tabs" role="group" aria-label="Filter kategori">
        {categories.map((category) => {
          const count =
            category === 'Semua'
              ? products.length
              : products.filter((product) => product.category === category).length;
          return (
            <button
              key={category}
              type="button"
              className="tab"
              aria-pressed={active === category}
              onClick={() => select(category)}
            >
              {category}
              <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 12 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <p className="result-count" aria-live="polite">
        Menampilkan {visible.length} produk
      </p>

      <div className="grid-4">
        {visible.map((product, index) => (
          <Reveal key={product.slug} delay={index} as="div">
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
