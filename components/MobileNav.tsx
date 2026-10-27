'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { NAV_ITEMS } from '@/components/NavLinks';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Tutup saat rute berubah.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape + klik di luar.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-menu-button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open ? (
        <div className="mobile-menu" id={menuId} ref={menuRef}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => setOpen(false)}
              aria-current={
                item.href === '/'
                  ? pathname === '/'
                    ? 'page'
                    : undefined
                  : pathname.startsWith(item.href)
                    ? 'page'
                    : undefined
              }
            >
              {item.label}
            </Link>
          ))}
          <Link href="/keranjang" onClick={() => setOpen(false)}>
            Keranjang
          </Link>
        </div>
      ) : null}
    </div>
  );
}
