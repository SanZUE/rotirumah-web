// FILE INI DIHASILKAN OTOMATIS oleh scripts/optimize-images.mjs
// Jangan diedit manual. Jalankan `npm run images:optimize` untuk memperbarui.

export type ImageAsset = {
  slug: string;
  widths: number[];
  aspect: number;
  /** data URI 20px untuk placeholder blur */
  lqip: string;
  /** warna dominan sebagai fallback */
  color: string;
};

export const images = {
  'bolen-cokelat': {
    slug: 'bolen-cokelat',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRrwAAABXRUJQVlA4ILAAAACQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JagCdMoAlrBl8JgUkw3/1HaVzzIAA/qnPqFMByhaBTlmGwoJQitSyU2C37ivqpg8Cjlajxo8sjQX/wrP++Zmls6qrW3MRGkKykWBRR0v9xWvJYxxWTymTvqawL3TZAa3KJWT10vioG9rXoSYY7lJ3a8917xNr6xRH7Bw6gPge6dfwF1ef1789+cQzUB7QwbRfU17Ub0AAAA==',
    color: '#9e876f',
  },
  'bolen-durian': {
    slug: 'bolen-durian',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqoAAABXRUJQVlA4IJ4AAABwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JbACdMoAlwBdK/7oFkRIHFYq/gAD+7d/llWQvBGzb8nc8iV24c1UE2yPuTLbG4PKZIA8jgFuK66U3RHhXUCQZonk5BuHvmmGP7nqfOEDBwYpljlNGKthhdEugOu/jnYSJzQ+w94N07rsCaURE0t9Y+ruIHdS9pYASbYf8vSwyfnMo7ZQAAA==',
    color: '#b1926a',
  },
  'bolen-keju': {
    slug: 'bolen-keju',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAABQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JbACdMoR3AdDotWu/iRHnELAAAP7nQJGf5o9zLutuFOFuafKqg1S8xqkjM3QY1RsY6pS4ThEmBUaRtVxMhcKfNq+4dlY5LUBdKTaFVILaMaxWrsY1X+xA8E72RgR7qwlpD1swM+wVvhhapcQ8TEhxq+M8Rj7ZRLzJLC/JqAA=',
    color: '#b9a281',
  },
  'bomboloni': {
    slug: 'bomboloni',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAABwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JaACdMoAlvhSrwQQ7610XhLIDAAD+634t2ELlRsQ9LC9dYeo1guS7ppYt6xPMoEIq1TWPNfLYy63A2ME3JuDXNql/llVq0PVSs3+/5pWqyfI2ztZxQmMN9R0hWx1JgQymr1A3p5JudAU3U+V+aQZ9hY1NB6QVXzrwy4+WPeFFXrCmyjUn8AAA',
    color: '#af997e',
  },
  'dapur': {
    slug: 'dapur',
    widths: [480, 768],
    aspect: 0.8,
    lqip: 'data:image/webp;base64,UklGRvQAAABXRUJQVlA4IOgAAADQBQCdASoUABkAPu1qrlCppaQiqAqpMB2JZAC1G2RnAVTaXCjrW+nNxuJIgpy337l9cxG2NSv2APkFLnFhpRrGs6b3VZntLZ54ZAy/PtoKTtklErThkMgmGRgSEiqb1D9pnte5qkRkxKEm/+Y3AUbgQE7KEgfsfsM4ElFO60OvfJc3mcifSFqlZYW+nCb3dsh0OgKxtG54xGszZZKT8ES6XNy25+UXJTVD6t3aVJXkcD4We/kY/6f9rl1l2lJOUjIlaBHnVAUVNoTNfqkHE1raReocctY3+r6l9nHEizL0oQtubVQu57YA',
    color: '#705f45',
  },
  'hero': {
    slug: 'hero',
    widths: [480, 768, 1080, 1440],
    aspect: 1.7778,
    lqip: 'data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAACwAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JQBOmUAAm3Vr9w0BuwAD96ncUhSQJRUpnfINtX7Hc5CzhFRAq96SdJvT00tYWdfK5pAzI3rCzd4pMqjHKx7pWlAp+XUPDnPo11DR5pIQLubds5MZ5xxbj3RnwAA==',
    color: '#a8927b',
  },
  'paket-hampers': {
    slug: 'paket-hampers',
    widths: [480, 768, 1080],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JaACdMoMYAD9i7Kk9UM1taKAAAN8xyCpnEE7H2T8wMKzkBaSMcWkLznKDkfgKrwPhPjO3EMjXxDG+dyNrNwUUH8AdmpISvDZvLOBW/u+MN0z228rih9FrM30UXr/3P98K0cEP88qvCeu9F44BT1RceusslHEWLsLkzT6rJqCTGgAA',
    color: '#af9474',
  },
  'paket-keluarga': {
    slug: 'paket-keluarga',
    widths: [480, 768, 1080],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAAAQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JYgCdIExBnE/3MeQBvM6rgAD+n0HTwWhPOmIoZe91YcMhkF5MD3VPT1QlqQ2mZFbSMp18YgpdbZGEBT286TYRIJDW6nFdVs7ThNSjI0BITGhWlDGldsYTST81WksWqo4D4BhiTDV+L8jkd8Yyhh3bSpBNKQEj8sItYWakCnkWzumr+VemYAAA',
    color: '#906d4c',
  },
  'paket-lebaran': {
    slug: 'paket-lebaran',
    widths: [480, 768, 1080],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRrIAAABXRUJQVlA4IKYAAAAwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JZACdMoMYADJilbthk93lvMAA/gmq1wouYS++EHufbqT5Xmi0HtEEXVD+5TSLInKBa5bmHGF1zgKAyEhAUpJsmQb3ceqTvTrw9Xp/1JPjimhSYT5h9oKQeMSzDCkSZYVdlw7pd8/g/JjKfzPeboAO09i1uSSwGfqDowpxda1115I3wn1WX5jxKqUtcAAA',
    color: '#a1805f',
  },
  'paket-ngopi': {
    slug: 'paket-ngopi',
    widths: [480, 768, 1080],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRrwAAABXRUJQVlA4ILAAAAAwBQCdASoUAA8APu1iqU2ppaOiMAgBMB2JaACdMoRwAkgQyDyemOfkt77IQKMO1D+crAD+BbMZABcVuNupgGnjwhrWF84KAeYyB0Nq3mI+lMvL9VAtONW/GmmTBRI9mrjUbd5yN+K13vMhWfbI6/T3dQuHAlY9FGzPAuggNfqwwPIUAKabASp6SYzdRg57CjdZFOZspuNtG/6Xob3soQ2SrURXDyq/TrawkBxVfJAAAA==',
    color: '#957859',
  },
  'paket-spesial': {
    slug: 'paket-spesial',
    widths: [480, 768, 1080],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAADwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JZACdMoRwAkgPdEUJ/TpuWLOMQtDAHwAA/lt0zifEBjqSexbAy7GXnhPqmQNZ1agZ10nAqzLUmtih+KiyLBMP2/mu5YMVVxxYhIt3B2y+tCChomlWqaXe51wc4mc7JbvawObCWQW4WRZ1YQJ7D/IcWLwg2hEwx180GB7ss4KCbBWZGo6Xzi5Qo7gAAA==',
    color: '#a08468',
  },
  'roti-cokelat': {
    slug: 'roti-cokelat',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAADQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JbACdMoAvQTQIoGfHt4ZwCQT8QvhYYAD+4NdfT6B9Ru95s4WQ1kgRPx92M8YD+0VMSOzCxx2tRYKVJXZ75yVAdA6zIl1amGClpnol9nI+Al+rWBXuEoTRixEp2zdH41+md80rauhs80b+R4yEHPdE3U8J9K3sEc0w9nrGt7G716/diZu3x8Vo6fIhuf1lAAA=',
    color: '#ac9173',
  },
  'roti-keju': {
    slug: 'roti-keju',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAADQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JbACdMoRwN0AALadZca43AowaU1iRGAD+7YPd5x+gle8g1l7ppAJ0sekjCIuJfhxQ7FEeczmcdndZkDyLH6kF1tC/3r9yABS19Xx84fi4xIRb12LH4y73PNfbJCilpwnfFZnZMtUUq3AC1yxUb3avdiRTMqrFkAwRRvSs5AAAAA==',
    color: '#bc9f7b',
  },
  'roti-sobek': {
    slug: 'roti-sobek',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAADwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JagCdMoMlsn/G8C4RWaTa2Ho9hjApaxAA/uJ05U5pDPVr7HyWmwPqz5k02B1R9hiChjkMc3BP6xMknqvu4Pn8oaGdwom+O5rbf24RU13N4/8WVoDRM4xbexAzIPKLzt7zK8CsT2WavSj6rRMOr3RDjbN4tnszqaP7aSW2Hz4QPUv8lhSCaEPKRwAAAA==',
    color: '#967957',
  },
  'roti-sosis': {
    slug: 'roti-sosis',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAADQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JagCdMoMYA+ga0Yt5C55KllevHqK7AAD8ij6pZeZK98I1KyMwWFQDcQG51VSVvb6pP0202Dd4NPcNmOBw4fmf34dPMth1YdBILSJCItLSnDEc6uIdvm2BxmB0tMvgjgxZYM+W2q/S4mTZ/6nz1UGZkf/Y+fPhAJdvz0fOKockkfUkehFh6kpOQgYAAA==',
    color: '#a08567',
  },
} satisfies Record<string, ImageAsset>;

export type ImageSlug = keyof typeof images;

export function getImage(slug: string): ImageAsset | undefined {
  return (images as Record<string, ImageAsset>)[slug];
}
