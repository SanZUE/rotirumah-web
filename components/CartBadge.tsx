'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export function CartBadge() {
  const { itemCount } = useCart();
  return (
    <Link href="/keranjang" className="nav-pill" aria-label={`Keranjang, ${itemCount} item`}>
      🛒 Keranjang{itemCount > 0 ? ` (${itemCount})` : ''}
    </Link>
  );
}
