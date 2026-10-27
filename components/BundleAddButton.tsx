'use client';

import { useCartActions } from '@/components/CartProvider';
import { useToast } from '@/components/Toast';
import type { Bundle } from '@/lib/content/bundles';

export function BundleAddButton({ bundle }: { bundle: Bundle }) {
  const { addItem } = useCartActions();
  const { showToast } = useToast();

  return (
    <button
      type="button"
      className="btn btn-brown"
      onClick={() => {
        addItem(
          {
            slug: `paket-${bundle.slug}`,
            name: bundle.name,
            variant: null,
            price: bundle.price,
            image: bundle.image,
            kind: 'bundle',
          },
          1,
        );
        showToast(`${bundle.name} masuk keranjang`, { label: 'Lihat', href: '/keranjang' });
      }}
    >
      Tambah ke keranjang
    </button>
  );
}
