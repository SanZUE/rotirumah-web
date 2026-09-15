'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="section">
      <div className="container empty-state">
        <div className="eyebrow">Terjadi masalah</div>
        <h1>Halaman belum bisa ditampilkan.</h1>
        <p>Coba muat ulang bagian ini. Kalau masalah tetap muncul, simpan pesan error-nya.</p>
        <button type="button" className="btn btn-brown" onClick={() => reset()}>
          Coba lagi
        </button>
      </div>
    </main>
  );
}
