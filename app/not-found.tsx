import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="section">
      <div className="container empty-state">
        <div className="eyebrow">404</div>
        <h1>Halaman tidak ditemukan.</h1>
        <p>Alamat yang kamu buka tidak tersedia atau produknya sudah dipindahkan.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link href="/" className="btn btn-brown">
            Kembali ke beranda
          </Link>
          <Link href="/menu" className="btn btn-ghost">
            Lihat menu
          </Link>
        </div>
      </div>
    </main>
  );
}
