export type ProductCategory = 'Andalan' | 'Reguler' | 'Musiman';

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  /** slug gambar di lib/images.generated.ts */
  image: string;
  imageAlt: string;
  variants?: string[];
  /** tampil di beranda */
  featured?: boolean;
  tags?: string[];
};

export const products: Product[] = [
  {
    slug: 'bolen-keju',
    name: 'Roti Bolen Keju',
    category: 'Andalan',
    price: 15000,
    description:
      'Bolen berlapis renyah dengan isian keju gurih yang lembut. Paling pas dinikmati hangat bersama kopi atau teh.',
    image: 'bolen-keju',
    imageAlt: 'Bolen keju hangat dengan lapisan pastry renyah dan isian keju lumer',
    variants: ['Keju', 'Cokelat', 'Pisang', 'Durian'],
    featured: true,
    tags: ['best seller', 'fresh harian'],
  },
  {
    slug: 'bolen-cokelat',
    name: 'Roti Bolen Cokelat',
    category: 'Andalan',
    price: 15000,
    description:
      'Lapisan pastry renyah dengan cokelat pekat yang lumer di setiap gigitan. Favorit anak-anak dan teman ngopi.',
    image: 'bolen-cokelat',
    imageAlt: 'Bolen cokelat dibelah dengan isian cokelat lumer',
    variants: ['Cokelat', 'Keju'],
    featured: true,
    tags: ['best seller'],
  },
  {
    slug: 'bomboloni',
    name: 'Donat Bomboloni',
    category: 'Andalan',
    price: 12000,
    description:
      'Donat empuk dengan filling melimpah di setiap gigitan, ditaburi gula halus. Tersedia beberapa pilihan rasa.',
    image: 'bomboloni',
    imageAlt: 'Tiga bomboloni bertabur gula halus dengan isian krim vanila',
    variants: ['Cokelat', 'Vanila', 'Strawberry', 'Tiramisu'],
    featured: true,
    tags: ['best seller'],
  },
  {
    slug: 'roti-sobek',
    name: 'Roti Sobek',
    category: 'Andalan',
    price: 18000,
    description:
      'Roti lembut bertekstur kapas untuk sarapan dan teman ngopi di rumah. Cocok dibagi bersama keluarga.',
    image: 'roti-sobek',
    imageAlt: 'Roti sobek lembut dengan tekstur berlapis yang mudah disobek',
    variants: ['Original', 'Cokelat', 'Keju'],
    featured: true,
    tags: ['cocok dibagi'],
  },
  {
    slug: 'roti-keju',
    name: 'Roti Keju',
    category: 'Andalan',
    price: 12000,
    description: 'Roti lembut dengan taburan keju gurih di atasnya. Sederhana tapi selalu habis.',
    image: 'roti-keju',
    imageAlt: 'Roti keju dengan taburan keju cheddar di atasnya',
  },
  {
    slug: 'roti-cokelat',
    name: 'Roti Cokelat',
    category: 'Reguler',
    price: 10000,
    description: 'Roti klasik dengan isian cokelat yang familiar dan nyaman. Pilihan aman untuk semua usia.',
    image: 'roti-cokelat',
    imageAlt: 'Roti cokelat lembut dengan isian cokelat di dalamnya',
  },
  {
    slug: 'roti-sosis',
    name: 'Roti Sosis',
    category: 'Reguler',
    price: 13000,
    description: 'Roti gurih dengan sosis dan saus yang pas. Cocok untuk bekal atau camilan sore.',
    image: 'roti-sosis',
    imageAlt: 'Roti sosis dengan saus tomat dan mayones di atasnya',
  },
  {
    slug: 'bolen-durian',
    name: 'Bolen Durian',
    category: 'Musiman',
    price: 16000,
    description:
      'Varian spesial dengan aroma dan rasa durian yang kuat. Ketersediaan mengikuti musim durian.',
    image: 'bolen-durian',
    imageAlt: 'Bolen durian dengan isian krim durian yang lembut',
    variants: ['Durian Medan', 'Durian Premium'],
    tags: ['musiman'],
  },
];

export const categories = ['Semua', 'Andalan', 'Reguler', 'Musiman'] as const;
export type CategoryFilter = (typeof categories)[number];

export const productCategories: ProductCategory[] = ['Andalan', 'Reguler', 'Musiman'];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const current = getProduct(slug);
  if (!current) return [];

  const sameCategory = products.filter(
    (product) => product.slug !== slug && product.category === current.category,
  );
  const rest = products.filter(
    (product) => product.slug !== slug && product.category !== current.category,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export function filterProducts(category: CategoryFilter): Product[] {
  if (category === 'Semua') return products;
  return products.filter((product) => product.category === category);
}

export const featuredProducts = products.filter((product) => product.featured);
