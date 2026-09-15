import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/components/CartProvider';

export const metadata: Metadata = {
  title: 'RotiRumah — Roti Rumahan Rasa Istimewa',
  description: 'Website toko roti rumahan RotiRumah.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a className="skip-link" href="#main-content">
          Lewati ke konten utama
        </a>
        <CartProvider>
          <Header />
          <div id="main-content">{children}</div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
