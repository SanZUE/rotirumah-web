import Link from 'next/link';
import { CartButton } from '@/components/CartButton';
import { HeaderShell } from '@/components/HeaderShell';
import { MobileNav } from '@/components/MobileNav';
import { NavLinks } from '@/components/NavLinks';

export function Header() {
  return (
    <HeaderShell>
      <div className="container nav">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            R
          </span>
          <span>RotiRumah</span>
        </Link>
        <NavLinks />
        <div className="nav-actions">
          <CartButton />
          <Link href="/menu" className="btn btn-brown" prefetch={false} style={{ minHeight: 44, padding: '10px 16px' }}>
            Pesan
          </Link>
          <MobileNav />
        </div>
      </div>
    </HeaderShell>
  );
}
