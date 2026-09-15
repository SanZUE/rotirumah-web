'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Product } from '@/lib/data';
import { rupiah } from '@/lib/data';
import { useCart } from './CartProvider';

export function ProductDetailClient({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const [selectedVariant, setSelectedVariant] = useState<string | null>(variants[0] ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const total = useMemo(() => product.price * qty, [product.price, qty]);

  function changeQty(delta: number) {
    setQty((current) => Math.max(1, current + delta));
  }

  function handleAdd() {
    addItem({
      slug: product.slug,
      name: product.name,
      variant: selectedVariant,
      price: product.price,
      image: product.image,
    }, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <div className="eyebrow">{product.category}</div>
      <h1>{product.name}</h1>
      <div className="price" style={{ fontSize: 24 }}>{rupiah(product.price)}</div>
      <p className="detail-copy">{product.description} Dibuat fresh setiap hari dengan bahan yang dipilih untuk menjaga tekstur dan rasa.</p>
      <div className="badges">
        <span className="badge">✓ Fresh setiap hari</span><span className="badge">✓ Bisa untuk pre-order</span><span className="badge">✓ Cocok untuk hadiah</span>
      </div>

      {variants.length > 0 ? (
        <fieldset className="variant-fieldset">
          <legend>Varian rasa</legend>
          <div className="variant-row">
            {variants.map((variant) => {
              const active = variant === selectedVariant;
              return (
                <button
                  key={variant}
                  type="button"
                  className={`variant ${active ? 'active' : ''}`}
                  aria-pressed={active}
                  onClick={() => setSelectedVariant(variant)}
                >
                  {variant}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="selection-summary" aria-live="polite">
        <span>Dipilih: <strong>{selectedVariant ?? 'Original'}</strong></span>
        <span>Jumlah: <strong>{qty}</strong></span>
      </div>

      <div className="qty" aria-label="Jumlah pesanan">
        <button type="button" aria-label="Kurangi jumlah" onClick={() => changeQty(-1)} disabled={qty === 1}>−</button>
        <span aria-live="polite">{qty}</span>
        <button type="button" aria-label="Tambah jumlah" onClick={() => changeQty(1)}>+</button>
      </div>

      <div className="detail-total"><span>Total</span><strong>{rupiah(total)}</strong></div>

      <button className="btn btn-brown" style={{ width: '100%' }} type="button" onClick={handleAdd}>
        {added ? '✓ Ditambahkan ke Keranjang' : 'Tambah ke Keranjang'}
      </button>
      <Link href="/keranjang" className="btn btn-ghost" style={{ width: '100%', marginTop: 8 }}>Lihat Keranjang</Link>
    </>
  );
}
