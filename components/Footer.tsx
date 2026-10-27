import Link from 'next/link';
import { site, whatsappUrl } from '@/lib/content/site';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              R
            </span>
            <span>RotiRumah</span>
          </Link>
          <p style={{ marginTop: 12, maxWidth: 340 }}>
            Roti enak, kebahagiaan sederhana. Dibuat fresh dari dapur rumahan untuk keluarga dan teman.
          </p>
        </div>

        <div>
          <h4>Jelajahi</h4>
          <div className="footer-links">
            <Link href="/menu" prefetch={false}>
              Menu
            </Link>
            <Link href="/paket" prefetch={false}>
              Paket &amp; Bundling
            </Link>
            <Link href="/tentang-kami" prefetch={false}>
              Tentang Kami
            </Link>
            <Link href="/keranjang" prefetch={false}>
              Keranjang
            </Link>
          </div>
        </div>

        <div>
          <h4>Hubungi</h4>
          <div className="footer-links">
            <a href={whatsappUrl()} target="_blank" rel="noreferrer">
              WhatsApp {site.contact.whatsappDisplay}
            </a>
            <a href={site.contact.instagramUrl} target="_blank" rel="noreferrer">
              Instagram {site.contact.instagramHandle}
            </a>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>Open order {site.hours}</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} RotiRumah. Dibuat di rumah, di {site.city}.</span>
          <span>Pickup gratis · Delivery mulai Rp10.000</span>
        </div>
      </div>
    </footer>
  );
}
