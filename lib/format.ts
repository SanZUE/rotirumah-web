/**
 * Utilitas format & validasi.
 *
 * Catatan performa: `Intl.NumberFormat` dibuat SEKALI di level modul, bukan
 * dipanggil ulang setiap render (versi lama membuat instance baru tiap panggilan).
 */

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('id-ID');

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

/** Rp15.000 */
export function rupiah(value: number): string {
  return rupiahFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** "Rabu, 28 Oktober 2026" dari "2026-10-28" (atau Date). */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00+07:00`) : value;
  return dateFormatter.format(date);
}

export function formatShortDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00+07:00`) : value;
  return shortDateFormatter.format(date);
}

/** Tanggal hari ini di zona Asia/Jakarta dalam bentuk YYYY-MM-DD. */
export function todayInJakarta(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return parts;
}

/** Tambah hari ke string YYYY-MM-DD, hasil YYYY-MM-DD. */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00+07:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Normalisasi nomor WhatsApp Indonesia ke format 62xxxxxxxxxx.
 * Mengembalikan null kalau tidak valid.
 */
export function normalizePhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-().]/g, '');
  if (!cleaned) return null;

  let digits = cleaned;
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;

  return /^628[1-9][0-9]{6,11}$/.test(digits) ? digits : null;
}

/** 6289606091861 -> 0896-0609-1861 (untuk ditampilkan). */
export function displayPhone(e164: string): string {
  const local = e164.startsWith('62') ? `0${e164.slice(2)}` : e164;
  return local.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Kode pesanan lokal: RR-20261028-A7K2 (acak kriptografis, bukan Math.random). */
export function makeOrderCode(prefix = 'RR'): string {
  const bytes = new Uint8Array(4);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  const suffix = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
  const stamp = todayInJakarta().replace(/-/g, '');
  return `${prefix}-${stamp}-${suffix}`;
}

/** Potong teks tanpa memotong kata di tengah (untuk meta description). */
export function truncate(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : cut.length)}…`;
}
