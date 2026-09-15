import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="section">
      <div className="container empty-state">
        <div className="eyebrow">404</div>
        <h1>Halaman tidak ditemukan.</h1>
        <p>Alamat yang kamu buka tidak tersedia atau produknya sudah dipindahkan.</p>
        <Link href="/" className="btn btn-brown">Kembali ke Beranda</Link>
      </div>
    </main>
  );
}
