'use client';

import { useEffect, useRef, useState } from 'react';
import { useCartSummary } from '@/components/CartProvider';
import { useCartUI } from '@/components/CartUI';

/** Tombol keranjang di header: badge angka dengan animasi "pop" saat bertambah. */
export function CartButton() {
  const { itemCount } = useCartSummary();
  const { openCart } = useCartUI();
  const [bump, setBump] = useState(false);
  const previous = useRef(itemCount);

  useEffect(() => {
    if (itemCount > previous.current) {
      setBump(true);
      const timer = window.setTimeout(() => setBump(false), 300);
      previous.current = itemCount;
      return () => window.clearTimeout(timer);
    }
    previous.current = itemCount;
    return undefined;
  }, [itemCount]);

  return (
    <button
      type="button"
      className="cart-pill"
      onClick={openCart}
      aria-haspopup="dialog"
      aria-label={`Buka keranjang, ${itemCount} item`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
      </svg>
      <span className="cart-label">Keranjang</span>
      {itemCount > 0 ? (
        <span className="cart-count" data-bump={bump ? 'true' : 'false'}>
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
