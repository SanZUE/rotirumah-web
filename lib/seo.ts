import { SITE_URL, site } from '@/lib/content/site';
import type { Product } from '@/lib/content/products';
import type { Bundle } from '@/lib/content/bundles';

/** JSON-LD untuk toko (dipakai di layout). */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    '@id': `${SITE_URL}/#bakery`,
    name: site.name,
    description: site.description,
    url: SITE_URL,
    image: `${SITE_URL}/og.jpg`,
    telephone: `+${site.contact.whatsappE164}`,
    priceRange: 'Rp10.000–Rp150.000',
    servesCuisine: 'Bakery',
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: 'ID',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: site.hoursOpen,
      closes: site.hoursClose,
    },
    sameAs: [site.contact.instagramUrl],
  };
}

export function productJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: `${SITE_URL}/img/${product.image}-1080.jpg`,
    brand: { '@type': 'Brand', name: site.name },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/menu/${product.slug}/`,
      priceCurrency: 'IDR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: site.name },
    },
  };
}

export function bundleJsonLd(bundle: Bundle) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.name,
    description: bundle.description,
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/paket/`,
      priceCurrency: 'IDR',
      price: bundle.price,
      availability: 'https://schema.org/InStock',
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
