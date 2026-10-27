'use client';

import Link from 'next/link';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { rupiah } from '@/lib/format';
import { Picture } from '@/components/Picture';
import { useCartActions, useCartSummary } from '@/components/CartProvider';

type CartUIContextValue = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function useCartUI(): CartUIContextValue {
  const value = useContext(CartUIContext);
  if (!value) throw new Error('useCartUI harus dipakai di dalam CartUIProvider');
  return value;
}

export function CartUIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openCart, closeCart }),
    [isOpen, openCart, closeCart],
  );

  return (
    <CartUIContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartUIContext.Provider>
  );
}

/** Drawer keranjang: slide-in, Escape, klik backdrop, focus trap, scroll lock. */
function CartDrawer() {
  const { isOpen, closeCart } = useCartUI();
  const { items, itemCount, subtotal, isEmpty } = useCartSummary();
  const { setQuantity, removeItem } = useCartActions();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<Element | null>(null);

  // Simpan elemen pemicu + kunci scroll + fokus awal.
  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement;
    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 30);

    return () => {
      window.clearTimeout(focusTimer);
      style.overflow = previousOverflow;
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [isOpen]);

  // Escape + focus trap.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeCart();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={closeCart} aria-hidden="true" />
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        ref={panelRef}
      >
        <div className="drawer-head">
          <h2 id="cart-drawer-title">Keranjang {itemCount > 0 ? `(${itemCount})` : ''}</h2>
          <button
            type="button"
            className="drawer-close"
            onClick={closeCart}
            ref={closeButtonRef}
            aria-label="Tutup keranjang"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {isEmpty ? (
            <div className="empty-state" style={{ minHeight: '30vh' }}>
              <h3>Keranjang masih kosong</h3>
              <p>Pilih roti favoritmu dari menu, lalu kembali ke sini untuk memesan.</p>
              <Link href="/menu" className="btn btn-brown" onClick={closeCart}>
                Lihat menu
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div className="drawer-item" key={item.key}>
                <div className="drawer-item-media">
                  <Picture slug={item.image} alt="" ratio={1} sizes="56px" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{item.name}</div>
                  {item.variant ? (
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{item.variant}</div>
                  ) : null}
                  <div className="cart-controls" style={{ marginTop: 6 }}>
                    <button
                      type="button"
                      data-action="dec"
                      onClick={() => setQuantity(item.key, item.qty - 1)}
                      disabled={item.qty <= 1}
                      aria-label={`Kurangi ${item.name}`}
                    >
                      −
                    </button>
                    <span className="cart-qty">{item.qty}</span>
                    <button
                      type="button"
                      data-action="inc"
                      onClick={() => setQuantity(item.key, item.qty + 1)}
                      aria-label={`Tambah ${item.name}`}
                    >
                      +
                    </button>
                    <button type="button" className="remove-btn" onClick={() => removeItem(item.key)}>
                      Hapus
                    </button>
                  </div>
                </div>
                <strong style={{ whiteSpace: 'nowrap' }}>{rupiah(item.price * item.qty)}</strong>
              </div>
            ))
          )}
        </div>

        {!isEmpty ? (
          <div className="drawer-foot">
            <div className="summary-row" style={{ margin: 0 }}>
              <span>Subtotal</span>
              <strong style={{ color: 'var(--brown)' }}>{rupiah(subtotal)}</strong>
            </div>
            <p className="summary-note" style={{ marginTop: 0 }}>
              Ongkir dihitung di halaman keranjang (pickup gratis).
            </p>
            <Link href="/keranjang" className="btn btn-brown btn-block" onClick={closeCart}>
              Lanjut ke keranjang
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
