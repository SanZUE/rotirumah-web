'use client';

import { useState } from 'react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_NUMBER_DISPLAY, whatsappUrl } from '@/lib/contact';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [need, setNeed] = useState('Pesan produk');
  const [message, setMessage] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = `Halo RotiRumah, saya ${name || 'pelanggan'}.\nWhatsApp: ${phone || '-'}\nKebutuhan: ${need}\nPesan: ${message || '-'}`;
    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
  }

  return (
    <main>
      <section className="page-hero"><div className="container"><div className="eyebrow">Kontak</div><h1>Hubungi kami</h1><p>Kami siap bantu memilih menu, membuat paket, atau menerima permintaan custom.</p></div></section>
      <section className="section" style={{ paddingTop: 18 }}>
        <div className="container contact-grid">
          <div className="contact-card">
            <h3 style={{ marginTop: 0 }}>RotiRumah</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>Untuk saat ini, WhatsApp adalah jalur utama order. Website berfungsi sebagai etalase dan hub.</p>
            <div className="contact-list">
              <div className="contact-row"><b>WhatsApp</b><a href={whatsappUrl()} target="_blank" rel="noreferrer">{WHATSAPP_NUMBER_DISPLAY}</a></div>
              <div className="contact-row"><b>Instagram</b><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">{INSTAGRAM_HANDLE}</a></div>
              <div className="contact-row"><b>Jam order</b><span>07.00–20.00 WIB</span></div>
              <div className="contact-row"><b>Area</b><span>Pickup &amp; delivery area sekitar dapur</span></div>
            </div>
          </div>
          <div className="contact-card">
            <h3 style={{ marginTop: 0 }}>Kirim pesan</h3>
            <form className="form" onSubmit={submit}>
              <label>Nama<input required className="input" placeholder="Nama kamu" value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label>No. WhatsApp<input required className="input" placeholder="08xxxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
              <label>Kebutuhan<select className="select" value={need} onChange={(e) => setNeed(e.target.value)}><option>Pesan produk</option><option>Paket / hampers</option><option>Custom order</option><option>Reseller</option></select></label>
              <label>Pesan<textarea required className="textarea" placeholder="Ceritakan kebutuhanmu..." value={message} onChange={(e) => setMessage(e.target.value)} /></label>
              <button className="btn btn-brown" type="submit">Kirim ke WhatsApp</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
