'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NAV_ITEMS = [
  { href: '/', label: 'Beranda' },
  { href: '/menu', label: 'Menu' },
  { href: '/paket', label: 'Paket' },
  { href: '/tentang-kami', label: 'Tentang Kami' },
  { href: '/testimoni', label: 'Testimoni' },
  { href: '/kontak', label: 'Kontak' },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="nav-links" aria-label="Navigasi utama">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch={false}
          aria-current={isActive(pathname, item.href) ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function useIsActive() {
  const pathname = usePathname();
  return (href: string) => isActive(pathname, href);
}
