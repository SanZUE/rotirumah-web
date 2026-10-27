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
    lqip: 'data:image/webp;base64,UklGRrgAAABXRUJQVlA4IKwAAACwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JbACdMoAlpRl8JhP0u7tYmRkCXAlAAP6pz6hSf99mL15ZhsJjGpvhXY/KsrCP1iRfGePConhmF5/V7UbPcFLW2HKZUrDs7z2sQjSLmZdxoYazDM5a0bBnCgG4A+gHYON8R+cvOJoA3244vefoguXPpDvmIz19rplZ5MNbKfkYd62szQEEnZyC1WS4Iu+xwWR1AAAA',
    color: '#a08971',
  },
  'bolen-durian': {
    slug: 'bolen-durian',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRq4AAABXRUJQVlA4IKIAAABQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JbACdMoADNl/2dAC6yn/3nYXgAP7t3+WVeLdL0ZULhIHUPSM4LWaotsMS9bjONDDWcSzWQKYrum7m9n9ijXHHJU+qitQ07Jnq6AZEEiq3NIndBH7SKkuP128g07Okcg9AGWnkHZvDVgVtuvAHucVaXX/mqcHXP+4JJQPWEoKdh0vloQZ5YvKAAAA=',
    color: '#b19169',
  },
  'bolen-keju': {
    slug: 'bolen-keju',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAABQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JbACdMoR3AdD0tWu/i9CL0+cAAP7nQJGg449zLutuFRSuafKsIVS8xuj2Y4sHhU3tWF19Z5zsroP/sHCQ3GzbrUME/Bw3eQoeecyMJjzZ/PXFXpVo7/nWNfE/BsFoaQDLM8bQvqfQ6hB8dJTQePd1vyrH3CYzO42HqQsJAAA=',
    color: '#b9a181',
  },
  'bomboloni': {
    slug: 'bomboloni',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAAAwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JaACdMoAlxRSrxmcjJ58biIAA/ut+Ldu/NO/AzNX3PQ7xi0lgPwdEfgq7MM97ktBND5Od7+wvjbCmPQvSS7659wzRTt9MSvD0MmXaGc59ay3COudSveDwsVtqT1Eb8UyFnd+9khyOUP7FVTT1l5IG+92Be83nX0Mx+85bMMab9AiLw5LOAAAA',
    color: '#b0987e',
  },
  'dapur': {
    slug: 'dapur',
    widths: [480, 768],
    aspect: 0.8,
    lqip: 'data:image/webp;base64,UklGRvQAAABXRUJQVlA4IOgAAACwBQCdASoUABkAPu1qrlCppaQiqAqpMB2JZACpFSBDu4/XSuB4ZOmxbh5ZAsl2iudfxqXY6IAA+QTc1AY0ax5RGrEjZJanF9RpY/L3AtqfwPn66oXRfWZMNLSSRHH1prLgpvUdfBunR+a5BGKGqAxBpN2c3KdNsdvP3TClSqKZVWF3bo6JH2VK/qu6mp4hGBuVLDSBgHHu/PFhsaEtMPAHQqLLUwIC3Mj1zYyu4wJ92TIcBje/6f9nknKxUGru24gVgseyu/YXDMwe/rMWdPBBmMyGNdszShVj92h+EGkTnY4YQoR5l4AA',
    color: '#705e44',
  },
  'hero': {
    slug: 'hero',
    widths: [480, 768, 1080, 1440],
    aspect: 1.7778,
    lqip: 'data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAACwAwCdASoUAAsAPu1iqU2ppaOiMAgBMB2JQBOmUAAnfWlLvBLoAAD96ncUhSQJRUpnfINtX7Hc5CzhFRAq96DswZl5JoUFYIsPg3rcxLDBlUY5WPdK0oEQ3lujlV+7xBh8Sl7b+W6vCBiA5HV6MxDpTIAAAA==',
    color: '#aa947c',
  },
  'roti-cokelat': {
    slug: 'roti-cokelat',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRrIAAABXRUJQVlA4IKYAAABwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JbACdMoAvQTPwoDa/49uZewetaAD+4NdfOHD0QJcZo4Q4oOEbtYqzjLNa/DDn0y3uPX/JHMEDXJ0fxhNT9MjfrLaMfkOgTCzinIQejbbt4Xye9kC+XWiLuSp33E2Y9xzlAutGUfN/0k+qtZV4gW7tborWDqFfZ7ta1Cv/QT60Kotp7yh1Nuh2/8z94AAA',
    color: '#ac9172',
  },
  'roti-keju': {
    slug: 'roti-keju',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAADQBACdASoUAA8APu1iqU2ppaOiMAgBMB2JbACdMoRwN0AALadZcZQLrMYzlJvIgAD+7YPd5x+gle8g1l7ppAJ0sekjCIuJfhxQ7FCxmjUx/fUljgPAVMqWSj8F40oWsgLV8fOH4uMWrfIBNfiUWBNrMTwNUa2SQ7HeLm4WuGrWSPTON4QBFgrz6KtakuO7Jkvruhy1qhAAAA==',
    color: '#be9f7b',
  },
  'roti-sobek': {
    slug: 'roti-sobek',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAACwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JagCdMoMlsn/LsAXHg8Shec6UpaxAAP7idOnL+kIjUU5/pgnccjysIjUQxiJgvMNZnSm5IJ5VUmWlWG0PDc7PfG/2W6tzn2rvtw138+tTHhsmcOO/bW/bB5RedveZXiUYr16raZ20+IvEhuxgLOLdBjXqu7BW6vduiczmiK0mIbwfmN0YZQAA',
    color: '#987a58',
  },
  'roti-sosis': {
    slug: 'roti-sosis',
    widths: [480, 768],
    aspect: 1.3333,
    lqip: 'data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAACwBACdASoUAA8APu1iqU2ppaOiMAgBMB2JagCdMoMYA0jFgEK1u/vVNoj1zJkAAPyOdeNdBsWlvpfQpx1lfJNmFBIsWX2+pu138ypBuUw1GmB+GdwCgE8/vEZXuzKqcNfcv1kRNze5k9PNapyFGu5rA4zA6WmXwRwYvv5ftHAWMv+JNfmf4duoom/+Wz0Yxy2PeIGQdIHBhhfQzb3NltIGFIAAAA==',
    color: '#a28667',
  },
} satisfies Record<string, ImageAsset>;

export type ImageSlug = keyof typeof images;

export function getImage(slug: string): ImageAsset | undefined {
  return (images as Record<string, ImageAsset>)[slug];
}
