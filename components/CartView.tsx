'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Picture } from '@/components/Picture';
import { useCartActions, useCartSummary } from '@/components/CartProvider';
import { site, whatsappUrl, type FulfilmentMethod } from '@/lib/content/site';
import {
  addDays,
  formatDate,
  makeOrderCode,
  normalizePhone,
  rupiah,
  todayInJakarta,
} from '@/lib/format';

type Errors = Partial<Record<'name' | 'phone' | 'date' | 'slot' | 'address' | 'note', string>>;

export function CartView() {
  const { items, itemCount, subtotal, hydrated } = useCartSummary();
  const { setQuantity, removeItem, clearCart } = useCartActions();

  const [method, setMethod] = useState<FulfilmentMethod>('pickup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(() => addDays(todayInJakarta(), 1));
  const [slot, setSlot] = useState<string>(site.slots[0]);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  const errorRef = useRef<HTMLDivElement | null>(null);

  const minDate = addDays(todayInJakarta(), site.preOrder.minDays);
  const maxDate = addDays(todayInJakarta(), site.preOrder.maxDays);

  const shipping = method === 'delivery' && items.length ? site.fulfilment.delivery.fee : 0;
  const total = subtotal + shipping;
  const belowMinimum =
    method === 'delivery' && subtotal > 0 && subtotal < site.fulfilment.delivery.minSubtotal;

  // Kode pesanan baru setiap kali isi keranjang berubah (dihitung sekali per perubahan).
  useEffect(() => {
    if (items.length) setOrderCode(makeOrderCode());
  }, [items]);

  const message = useMemo(() => {
    const lines = items.map((item) => {
      const variant = item.variant ? ` (${item.variant})` : '';
      return `• ${item.name}${variant} ×${item.qty} — ${rupiah(item.price * item.qty)}`;
    });

    const rows = [
      'Halo RotiRumah 👋',
      `Saya ingin memesan${orderCode ? ` (kode: ${orderCode})` : ''}`,
      '',
      `Nama: ${name || '-'}`,
      `WhatsApp: ${phone || '-'}`,
      `Metode: ${site.fulfilment[method].label}`,
      `Tanggal: ${date ? formatDate(date) : '-'}`,
      `Slot: ${slot}`,
    ];

    if (method === 'delivery') rows.push(`Alamat: ${address || '-'}`);

    rows.push('', 'Rincian:', ...lines, '', `Subtotal: ${rupiah(subtotal)}`);
    rows.push(`Ongkir: ${rupiah(shipping)}`);
    rows.push(`Total: ${rupiah(total)}`);

    if (note.trim()) rows.push('', `Catatan: ${note.trim()}`);
    rows.push('', 'Mohon dikonfirmasi ketersediaannya. Terima kasih!');

    return rows.join('\n');
  }, [items, orderCode, name, phone, method, date, slot, address, subtotal, shipping, total, note]);

  function validate(): Errors {
    const next: Errors = {};

    if (name.trim().length < 2) next.name = 'Nama minimal 2 karakter.';
    if (name.trim().length > site.limits.maxNameLength)
      next.name = `Nama maksimal ${site.limits.maxNameLength} karakter.`;

    if (!normalizePhone(phone)) next.phone = 'Nomor WhatsApp belum valid (contoh: 0896…).';

    if (!date || date < minDate || date > maxDate)
      next.date = `Pilih tanggal antara ${formatDate(minDate)} dan ${formatDate(maxDate)}.`;

    if (!site.slots.includes(slot as (typeof site.slots)[number])) next.slot = 'Pilih jam ambil/kirim.';

    if (method === 'delivery') {
      if (address.trim().length < 10) next.address = 'Alamat wajib diisi minimal 10 karakter.';
      if (address.trim().length > site.limits.maxAddressLength)
        next.address = `Alamat maksimal ${site.limits.maxAddressLength} karakter.`;
    }

    if (note.length > site.limits.maxNoteLength)
      next.note = `Catatan maksimal ${site.limits.maxNoteLength} karakter.`;

    return next;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        errorRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    const url = whatsappUrl(message);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) setPopupBlocked(true);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      setPopupBlocked(true);
    }
  }

  if (!hydrated) {
    return (
      <div className="cart-layout" aria-busy="true" aria-live="polite">
        <div className="cart-list">
          <div className="skeleton" style={{ height: 112 }} />
          <div className="skeleton" style={{ height: 112 }} />
        </div>
        <aside className="summary">
          <div className="skeleton" style={{ height: 140 }} />
        </aside>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <h2>Keranjang masih kosong</h2>
        <p>Pilih roti favoritmu dari menu. Setelah itu kamu bisa mengatur jumlah, metode ambil, dan tanggal pesanan di sini.</p>
        <Link href="/menu" className="btn btn-brown">
          Lihat menu
        </Link>
      </div>
    );
  }

  const invalid = (field: keyof Errors) => (errors[field] ? 'true' : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="cart-layout">
        <div>
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.key}>
                <div className="cart-item-media">
                  <Picture slug={item.image} alt="" ratio={1} sizes="84px" />
                </div>
                <div className="cart-item-body">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-meta">
                    {item.variant ? `${item.variant} · ` : ''}
                    {rupiah(item.price)} / item
                  </div>
                  <div className="cart-controls">
                    <button
                      type="button"
                      data-action="dec"
                      onClick={() => setQuantity(item.key, item.qty - 1)}
                      disabled={item.qty <= 1}
                      aria-label={`Kurangi ${item.name}`}
                    >
                      −
                    </button>
                    <span className="cart-qty" aria-live="polite">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      data-action="inc"
                      onClick={() => setQuantity(item.key, item.qty + 1)}
                      aria-label={`Tambah ${item.name}`}
                    >
                      +
                    </button>
                    <button type="button" className="remove-btn" onClick={() => removeItem(item.key)}>
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="cart-item-total">{rupiah(item.price * item.qty)}</div>
              </article>
            ))}
          </div>

          <div className="cart-actions" style={{ marginTop: 14 }}>
            <Link href="/menu" className="link-more">
              ← Lanjut belanja
            </Link>
            <button type="button" className="text-button" onClick={clearCart}>
              Kosongkan keranjang
            </button>
          </div>

          <div className="checkout" ref={errorRef}>
            <h2>Detail pesanan</h2>

            <label className="field">
              Nama
              <input
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nama kamu"
                autoComplete="name"
                aria-invalid={invalid('name')}
                aria-describedby={errors.name ? 'error-name' : undefined}
                maxLength={site.limits.maxNameLength}
              />
              {errors.name ? (
                <span className="field-error" id="error-name" role="alert">
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
                placeholder="0896xxxxxxxx"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={invalid('phone')}
                aria-describedby={errors.phone ? 'error-phone' : undefined}
              />
              {errors.phone ? (
                <span className="field-error" id="error-phone" role="alert">
                  {errors.phone}
                </span>
              ) : null}
            </label>

            <div className="field field-full">
              <span>Metode</span>
              <div className="segmented">
                {(['pickup', 'delivery'] as FulfilmentMethod[]).map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="method"
                      value={option}
                      checked={method === option}
                      onChange={() => setMethod(option)}
                    />
                    {site.fulfilment[option].label}
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}>
                      {site.fulfilment[option].fee === 0
                        ? 'Gratis'
                        : `+${rupiah(site.fulfilment[option].fee)}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {method === 'delivery' ? (
              <label className="field field-full">
                Alamat pengantaran
                <textarea
                  className="textarea"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Nama jalan, nomor rumah, patokan"
                  aria-invalid={invalid('address')}
                  aria-describedby={errors.address ? 'error-address' : undefined}
                  maxLength={site.limits.maxAddressLength}
                />
                {errors.address ? (
                  <span className="field-error" id="error-address" role="alert">
                    {errors.address}
                  </span>
                ) : null}
              </label>
            ) : null}

            <label className="field">
              Tanggal
              <input
                className="input"
                type="date"
                value={date}
                min={minDate}
                max={maxDate}
                onChange={(event) => setDate(event.target.value)}
                aria-invalid={invalid('date')}
                aria-describedby={errors.date ? 'error-date' : undefined}
              />
              {errors.date ? (
                <span className="field-error" id="error-date" role="alert">
                  {errors.date}
                </span>
              ) : null}
            </label>

            <label className="field">
              Jam
              <select
                className="select"
                value={slot}
                onChange={(event) => setSlot(event.target.value)}
                aria-invalid={invalid('slot')}
              >
                {site.slots.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-full">
              Catatan (opsional)
              <textarea
                className="textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Mis. tanpa kacang, potong jadi 8, tulis ucapan di kartu"
                style={{ minHeight: 84 }}
                maxLength={site.limits.maxNoteLength}
                aria-invalid={invalid('note')}
              />
              <small>
                {note.length}/{site.limits.maxNoteLength}
              </small>
            </label>

            {submitted && Object.keys(errors).length > 0 ? (
              <div className="form-error" role="alert">
                Ada {Object.keys(errors).length} isian yang perlu diperbaiki sebelum pesanan dikirim.
              </div>
            ) : null}

            {belowMinimum ? (
              <div className="form-error" role="alert">
                Minimal belanja untuk diantar adalah {rupiah(site.fulfilment.delivery.minSubtotal)}.
                Pilih ambil sendiri atau tambah pesanan.
              </div>
            ) : null}

            <p className="form-hint">
              Pesanan dikirim lewat WhatsApp dan dikonfirmasi manual oleh dapur. Kode pesanan:{' '}
              <strong>{orderCode || '—'}</strong>
            </p>
          </div>
        </div>

        <aside className="summary">
          <h2>Ringkasan pesanan</h2>
          <div className="summary-row">
            <span>Item</span>
            <span>{itemCount}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{rupiah(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Ongkir ({site.fulfilment[method].short})</span>
            <span>{shipping === 0 ? 'Gratis' : rupiah(shipping)}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>{rupiah(total)}</span>
          </div>

          <button
            type="submit"
            className="btn btn-brown btn-block"
            style={{ marginTop: 16 }}
            disabled={belowMinimum}
          >
            Pesan via WhatsApp
          </button>

          <p className="summary-note">
            Kamu akan diarahkan ke WhatsApp dengan rincian pesanan yang sudah terisi otomatis.
          </p>

          {popupBlocked ? (
            <div className="form-error" style={{ marginTop: 12 }} role="alert">
              <p style={{ marginBottom: 8 }}>
                Browser memblokir tab WhatsApp. Salin pesan di bawah lalu kirim manual.
              </p>
              <button type="button" className="btn btn-ghost btn-block" onClick={copyMessage}>
                Salin pesan
              </button>
              <textarea
                className="textarea"
                readOnly
                value={message}
                style={{ marginTop: 8, minHeight: 120 }}
                aria-label="Rincian pesanan untuk disalin"
              />
            </div>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
