'use client';

import { useState } from 'react';
import { whatsappUrl } from '@/lib/content/site';
import { normalizePhone } from '@/lib/format';

const NEEDS = ['Pesan produk', 'Paket / hampers', 'Custom order', 'Reseller'] as const;

type Errors = Partial<Record<'name' | 'phone' | 'message', string>>;

export function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [need, setNeed] = useState<string>(NEEDS[0]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [popupBlocked, setPopupBlocked] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Errors = {};

    if (name.trim().length < 2) nextErrors.name = 'Nama minimal 2 karakter.';
    if (!normalizePhone(phone)) nextErrors.phone = 'Nomor WhatsApp belum valid (contoh: 0896…).';
    if (message.trim().length < 5) nextErrors.message = 'Tulis kebutuhanmu minimal 5 karakter.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const text = [
      'Halo RotiRumah 👋',
      `Saya ${name.trim()}.`,
      `WhatsApp: ${phone.trim()}`,
      `Kebutuhan: ${need}`,
      `Pesan: ${message.trim()}`,
    ].join('\n');

    const url = whatsappUrl(text);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) setPopupBlocked(url);
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        Nama
        <input
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nama kamu"
          autoComplete="name"
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'contact-error-name' : undefined}
        />
        {errors.name ? (
          <span className="field-error" id="contact-error-name" role="alert">
            {errors.name}
          </span>
        ) : null}
      </label>

      <label className="field">
        No. WhatsApp
        <input
          className="input"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="08xxxxxxxxxx"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={errors.phone ? 'true' : undefined}
          aria-describedby={errors.phone ? 'contact-error-phone' : undefined}
        />
        {errors.phone ? (
          <span className="field-error" id="contact-error-phone" role="alert">
            {errors.phone}
          </span>
        ) : null}
      </label>

      <label className="field">
        Kebutuhan
        <select className="select" value={need} onChange={(event) => setNeed(event.target.value)}>
          {NEEDS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        Pesan
        <textarea
          className="textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ceritakan kebutuhanmu, tanggal acara, atau jumlah pesanan"
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? 'contact-error-message' : undefined}
        />
        {errors.message ? (
          <span className="field-error" id="contact-error-message" role="alert">
            {errors.message}
          </span>
        ) : null}
      </label>

      <button className="btn btn-brown" type="submit">
        Kirim ke WhatsApp
      </button>

      {popupBlocked ? (
        <p className="form-error" role="alert">
          Browser memblokir tab WhatsApp.{' '}
          <a href={popupBlocked} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
            Buka manual di sini
          </a>
          .
        </p>
      ) : null}
    </form>
  );
}
