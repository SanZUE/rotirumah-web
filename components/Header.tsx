import Link from 'next/link';
import { CartBadge } from './CartBadge';
import { MobileNav } from './MobileNav';

export function Header() {
  return (
    <header className="header-shell">
      <div className="container nav">
        <Link href="/" className="brand"><span className="brand-mark">R</span><span>RotiRumah</span></Link>
        <nav className="nav-links" aria-label="Navigasi utama">
          <Link href="/">Beranda</Link><Link href="/menu">Menu</Link><Link href="/paket">Paket</Link><Link href="/tentang-kami">Tentang Kami</Link><Link href="/testimoni">Testimoni</Link><Link href="/kontak">Kontak</Link>
        </nav>
        <div className="nav-actions"><CartBadge /><Link href="/menu" className="nav-primary">Pesan Sekarang</Link><MobileNav /></div>
      </div>
    </header>
  );
}
