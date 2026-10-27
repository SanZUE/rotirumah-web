'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { QuantityStepper } from '@/components/QuantityStepper';
import { useCartActions } from '@/components/CartProvider';
import { useCartUI } from '@/components/CartUI';
import { useToast } from '@/components/Toast';
import { rupiah } from '@/lib/format';
import type { Product } from '@/lib/content/products';

export function ProductDetailClient({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const [variant, setVariant] = useState<string | null>(variants[0] ?? null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCartActions();
  const { showToast } = useToast();
  const { openCart } = useCartUI();

  const total = useMemo(() => product.price * qty, [product.price, qty]);

  function handleAdd() {
    addItem(
      {
        slug: product.slug,
        name: product.name,
        variant,
        price: product.price,
        image: product.image,
        kind: 'product',
      },
      qty,
    );
    showToast(`${qty}× ${product.name} masuk keranjang`, { label: 'Lihat', href: '/keranjang' });
  }

  function handleAddAndOpen() {
    addItem(
      {
        slug: product.slug,
        name: product.name,
        variant,
        price: product.price,
        image: product.image,
        kind: 'product',
      },
      qty,
    );
    openCart();
  }

  return (
    <>
      <div className="eyebrow">{product.category}</div>
      <h1>{product.name}</h1>
      <div className="price-lg">{rupiah(product.price)}</div>
      <p className="detail-copy">{product.description}</p>

      <div className="badges">
        <span className="badge">✓ Fresh setiap hari</span>
        <span className="badge">✓ Bisa pre-order</span>
        <span className="badge">✓ Cocok untuk hadiah</span>
      </div>

      {variants.length > 0 ? (
        <fieldset className="variant-fieldset">
          <legend>Varian rasa</legend>
          <div className="variant-row">
            {variants.map((option) => {
              const isActive = option === variant;
              return (
                <button
                  key={option}
                  type="button"
                  className="variant"
                  aria-pressed={isActive}
                  onClick={() => setVariant(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="selection-summary" aria-live="polite">
        <span>
          Dipilih: <strong>{variant ?? 'Original'}</strong>
        </span>
        <span>
          Jumlah: <strong>{qty}</strong>
        </span>
      </div>

      <QuantityStepper value={qty} onChange={setQty} label="Jumlah" />

      <div className="detail-total">
        <span>Total</span>
        <strong>{rupiah(total)}</strong>
      </div>

      <div className="detail-actions">
        <button type="button" className="btn btn-brown btn-block" onClick={handleAdd}>
          Tambah ke Keranjang
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={handleAddAndOpen}>
          Tambah &amp; buka keranjang
        </button>
        <Link href="/menu" className="link-more" style={{ justifyContent: 'center' }}>
          ← Kembali ke menu
        </Link>
      </div>
    </>
  );
}
