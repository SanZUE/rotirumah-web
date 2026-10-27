'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Dicatat supaya bisa dilaporkan tanpa menebak.
    console.error('RotiRumah:error', error);
  }, [error]);

  return (
    <main className="section">
      <div className="container empty-state">
        <div className="eyebrow">Terjadi masalah</div>
        <h1>Halaman belum bisa ditampilkan.</h1>
        <p>Coba muat ulang bagian ini. Kalau masalah tetap muncul, simpan pesan error-nya.</p>
        <button type="button" className="btn btn-brown" onClick={reset}>
          Coba lagi
        </button>
      </div>
    </main>
  );
}
