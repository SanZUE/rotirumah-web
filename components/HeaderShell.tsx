'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Header sticky dengan bayangan saat halaman di-scroll.
 * Sengaja tanpa state React: satu listener pasif + rAF, hanya mengubah atribut.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      node.setAttribute('data-scrolled', window.scrollY > 8 ? 'true' : 'false');
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="header-shell" ref={ref}>
      {children}
    </header>
  );
}
