export const WHATSAPP_NUMBER_DISPLAY = '0896-0609-1861';
export const WHATSAPP_NUMBER_E164 = '6289606091861';
export const INSTAGRAM_HANDLE = '@bundaihza01';
export const INSTAGRAM_URL = 'https://instagram.com/bundaihza01';

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER_E164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
