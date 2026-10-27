import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/components/CartProvider';
import { CartUIProvider } from '@/components/CartUI';
import { ToastProvider } from '@/components/Toast';
import { SITE_URL, site } from '@/lib/content/site';
import { localBusinessJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'roti rumahan',
    'bolen',
    'bomboloni',
    'roti sobek',
    'hampers roti',
    'pre-order roti',
    'bandung',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: site.name,
    url: SITE_URL,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: 'og.jpg', width: 1200, height: 630, alt: `${site.name}: roti rumahan fresh setiap hari` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ['og.jpg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#6f3c22',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={site.lang}>
      <body>
        <a className="skip-link" href="#main-content">
          Lewati ke konten utama
        </a>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
        <ToastProvider>
          <CartProvider>
            <CartUIProvider>
              <Header />
              <div id="main-content" tabIndex={-1}>
                {children}
              </div>
              <Footer />
            </CartUIProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
