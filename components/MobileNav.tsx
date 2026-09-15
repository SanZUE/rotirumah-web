'use client';

import Link from 'next/link';
import { useState } from 'react';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-nav">
      <button className="mobile-menu-button" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
        <span aria-hidden="true">☰</span>
        <span className="sr-only">Buka menu</span>
      </button>
      {open ? (
        <div id="mobile-menu" className="mobile-menu">
          <Link href="/" onClick={() => setOpen(false)}>Beranda</Link>
          <Link href="/menu" onClick={() => setOpen(false)}>Menu</Link>
          <Link href="/paket" onClick={() => setOpen(false)}>Paket</Link>
          <Link href="/tentang-kami" onClick={() => setOpen(false)}>Tentang Kami</Link>
          <Link href="/testimoni" onClick={() => setOpen(false)}>Testimoni</Link>
          <Link href="/kontak" onClick={() => setOpen(false)}>Kontak</Link>
          <Link href="/keranjang" onClick={() => setOpen(false)}>Keranjang</Link>
        </div>
      ) : null}
    </div>
  );
}
