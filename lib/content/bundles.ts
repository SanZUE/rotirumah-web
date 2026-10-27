export type Bundle = {
  slug: string;
  name: string;
  price: number;
  description: string;
  /** isi paket, ditampilkan sebagai daftar */
  contents: string[];
  image: string;
  imageAlt: string;
  badge?: string;
};

export const bundles: Bundle[] = [
  {
    slug: 'paket-ngopi',
    name: 'Paket Ngopi',
    price: 45000,
    description: 'Kombinasi pas untuk berdua saat ngopi sore atau kerja dari rumah.',
    contents: ['1 roti sobek mini', '2 bolen pilihan', '2 bomboloni'],
    image: 'hero', // TODO: ganti ke 'paket-ngopi' setelah foto paket digenerate
    imageAlt: 'Paket ngopi berisi roti sobek mini, bolen, dan bomboloni di samping kopi',
    badge: 'Paling sering dipesan',
  },
  {
    slug: 'paket-keluarga',
    name: 'Paket Keluarga',
    price: 85000,
    description: 'Campuran produk favorit untuk kumpul keluarga di rumah.',
    contents: ['6 bolen campur rasa', '4 bomboloni', '2 roti sobek'],
    image: 'roti-sobek', // TODO: ganti ke 'paket-keluarga' setelah foto paket digenerate
    imageAlt: 'Paket keluarga berisi aneka roti dan bolen di atas talenan kayu',
  },
  {
    slug: 'paket-hampers',
    name: 'Paket Hampers',
    price: 120000,
    description: 'Pilihan roti dan bolen dalam kemasan rapi untuk hadiah keluarga atau rekan kerja.',
    contents: ['8 bolen pilihan', '4 bomboloni', '1 roti sobek', 'kemasan hadiah'],
    image: 'bolen-keju', // TODO: ganti ke 'paket-hampers' setelah foto paket digenerate
    imageAlt: 'Paket hampers roti dalam keranjang anyaman dengan pita cokelat',
    badge: 'Cocok untuk hadiah',
  },
  {
    slug: 'paket-spesial',
    name: 'Paket Spesial',
    price: 150000,
    description: 'Isi bisa disesuaikan untuk acara, syukuran, atau kebutuhan kantor.',
    contents: ['isi custom sesuai permintaan', 'kemasan sesuai tema acara', 'kartu ucapan'],
    image: 'bolen-cokelat', // TODO: ganti ke 'paket-spesial' setelah foto paket digenerate
    imageAlt: 'Paket spesial dalam kotak hadiah warna krem berisi aneka pastry',
  },
  {
    slug: 'paket-lebaran',
    name: 'Paket Lebaran',
    price: 120000,
    description: 'Hampers keluarga untuk berbagi di momen spesial. Pre-order lebih awal.',
    contents: ['8 bolen campur rasa', 'kemasan lebaran', 'kartu ucapan'],
    image: 'bomboloni', // TODO: ganti ke 'paket-lebaran' setelah foto paket digenerate
    imageAlt: 'Paket lebaran berisi bolen dalam kemasan hampers',
    badge: 'Musiman',
  },
];

export function getBundle(slug: string): Bundle | undefined {
  return bundles.find((bundle) => bundle.slug === slug);
}
