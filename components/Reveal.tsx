'use client';

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

/**
 * Scroll reveal tanpa dependency.
 *
 * Satu IntersectionObserver dipakai bersama semua elemen (dibuat malas).
 * Saat elemen masuk viewport kita hanya memasang atribut `data-shown` —
 * TIDAK memakai state, jadi nol re-render React untuk 9–15 kartu.
 * Setelah tampil, elemen langsung di-unobserve.
 */

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const callback = callbacks.get(entry.target);
        if (callback) {
          callback();
          callbacks.delete(entry.target);
        }
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  return observer;
}

export type RevealProps = {
  children: ReactNode;
  /** elemen yang dirender, default div */
  as?: ElementType;
  /** urutan stagger; dibatasi 0–5 supaya item ke-20 tidak menunggu lama */
  delay?: number;
  className?: string;
};

export function Reveal({ children, as: Tag = 'div', delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      node.setAttribute('data-shown', 'true');
      return;
    }

    const io = getObserver();
    if (!io) {
      node.setAttribute('data-shown', 'true');
      return;
    }

    callbacks.set(node, () => node.setAttribute('data-shown', 'true'));
    io.observe(node);

    // Jaring pengaman: kalau observer tidak pernah terpicu (mis. elemen di
    // dalam kontainer tersembunyi), tetap tampilkan setelah 2,5 detik.
    const safety = window.setTimeout(() => node.setAttribute('data-shown', 'true'), 2500);

    return () => {
      window.clearTimeout(safety);
      callbacks.delete(node);
      io.unobserve(node);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={{ '--reveal-delay': Math.min(Math.max(delay, 0), 5) } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
