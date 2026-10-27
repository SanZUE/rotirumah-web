/**
 * Konfigurasi tunggal untuk identitas, kontak, dan aturan pesanan.
 * Semua angka bisnis (ongkir, minimal belanja, jam) ada di sini — jangan
 * di-hardcode lagi di komponen.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://sanzue.github.io/rotirumah-web';

export const site = {
  name: 'RotiRumah',
  tagline: 'Roti rumahan, rasa istimewa.',
  description:
    'Roti rumahan fresh setiap hari: bolen, bomboloni, roti sobek, dan paket hampers. Pre-order untuk acara, pickup atau delivery.',
  locale: 'id_ID',
  lang: 'id',
  timeZone: 'Asia/Jakarta',
  city: 'Bandung',
  region: 'Jawa Barat',

  contact: {
    whatsappDisplay: '0896-0609-1861',
    whatsappE164: '6289606091861',
    instagramHandle: '@bundaihza01',
    instagramUrl: 'https://instagram.com/bundaihza01',
  },

  hours: '07.00–20.00 WIB',
  hoursOpen: '07:00',
  hoursClose: '20:00',

  fulfilment: {
    pickup: { label: 'Ambil di dapur', short: 'Pickup', fee: 0, minSubtotal: 0 },
    delivery: { label: 'Diantar', short: 'Delivery', fee: 10_000, minSubtotal: 50_000 },
  },

  slots: ['07.00–10.00', '10.00–13.00', '13.00–16.00', '16.00–19.00'] as const,

  preOrder: { minDays: 1, maxDays: 14 },

  limits: {
    maxQtyPerItem: 20,
    maxItems: 60,
    maxNoteLength: 300,
    maxNameLength: 60,
    maxAddressLength: 200,
  },
} as const;

export type FulfilmentMethod = keyof typeof site.fulfilment;

export const DELIVERY_FEE = site.fulfilment.delivery.fee;

/** URL WhatsApp dengan pesan opsional. */
export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${site.contact.whatsappE164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
