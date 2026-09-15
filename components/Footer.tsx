import Link from 'next/link';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_NUMBER_DISPLAY, whatsappUrl } from '@/lib/contact';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand"><span className="brand-mark">R</span><span>RotiRumah</span></div>
          <p>Roti enak, kebahagiaan sederhana. Dibuat fresh dari dapur rumahan untuk keluarga dan teman.</p>
        </div>
        <div>
          <h4>Jelajahi</h4>
          <p>
            <Link href="/menu">Menu</Link><br/>
            <Link href="/paket">Paket &amp; Bundling</Link><br/>
            <Link href="/tentang-kami">Tentang Kami</Link>
          </p>
        </div>
        <div>
          <h4>Hubungi</h4>
          <p>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer">WhatsApp: {WHATSAPP_NUMBER_DISPLAY}</a><br/>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram: {INSTAGRAM_HANDLE}</a><br/>
            Open order: 07.00–20.00
          </p>
        </div>
      </div>
      <div className="footer-bottom"><div className="container">© 2026 RotiRumah. Prototype website.</div></div>
    </footer>
  );
}
