import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';
import { site, whatsappUrl } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Kontak & Pemesanan',
  description:
    'Hubungi RotiRumah lewat WhatsApp atau Instagram untuk pesan roti, paket hampers, custom order, dan kerja sama reseller.',
  alternates: { canonical: '/kontak/' },
  openGraph: {
    title: `Kontak & Pemesanan · ${site.name}`,
    description: 'WhatsApp adalah jalur utama pemesanan RotiRumah.',
    url: '/kontak/',
  },
};

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Kontak</div>
          <h1>Hubungi kami</h1>
          <p>
            Kami siap bantu memilih menu, membuat paket, atau menerima permintaan custom. WhatsApp
            adalah jalur tercepat.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <div className="container contact-grid">
          <div className="contact-card">
            <h2>{site.name}</h2>
            <p>
              Untuk saat ini, WhatsApp adalah jalur utama order. Website berfungsi sebagai etalase
              dan titik awal pemesanan.
            </p>

            <div className="contact-list">
              <div className="contact-row">
                <b>WhatsApp</b>
                <a href={whatsappUrl()} target="_blank" rel="noreferrer">
                  {site.contact.whatsappDisplay}
                </a>
              </div>
              <div className="contact-row">
                <b>Instagram</b>
                <a href={site.contact.instagramUrl} target="_blank" rel="noreferrer">
                  {site.contact.instagramHandle}
                </a>
              </div>
              <div className="contact-row">
                <b>Jam order</b>
                <span>{site.hours}</span>
              </div>
              <div className="contact-row">
                <b>Area</b>
                <span>Pickup &amp; delivery sekitar {site.city}</span>
              </div>
              <div className="contact-row">
                <b>Pre-order</b>
                <span>Minimal H-{site.preOrder.minDays} untuk jumlah besar</span>
              </div>
            </div>
          </div>

          <div className="contact-card">
            <h2>Kirim pesan</h2>
            <p>Isi form ini, lalu pesan akan diteruskan ke WhatsApp kami.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
