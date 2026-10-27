import Link from 'next/link';
import type { Metadata } from 'next';
import { Reveal } from '@/components/Reveal';
import { testimonials } from '@/lib/content/testimonials';
import { site, whatsappUrl } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Testimoni Pelanggan',
  description:
    'Cerita pelanggan RotiRumah tentang bolen keju, bomboloni, roti sobek, dan pelayanan pesanan rumahan.',
  alternates: { canonical: '/testimoni/' },
  openGraph: {
    title: `Testimoni Pelanggan · ${site.name}`,
    description: 'Apa kata mereka yang sudah mencoba roti rumahan RotiRumah.',
    url: '/testimoni/',
  },
};

export default function TestimonialsPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Testimoni</div>
          <h1>Apa kata mereka?</h1>
          <p>
            Kepercayaan dibangun dari pengalaman pelanggan. Ini beberapa cerita yang paling sering
            kami terima lewat WhatsApp.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <div className="container grid-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index}>
              <article className="card review">
                <div className="stars" aria-label={`Rating ${testimonial.rating} dari 5`}>
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p>“{testimonial.text}”</p>
                <div className="reviewer">
                  <div className="avatar" aria-hidden="true">
                    {testimonial.initial}
                  </div>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <small>
                      {testimonial.role}
                      {testimonial.product ? ` · ${testimonial.product}` : ''}
                    </small>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Sudah pernah pesan?</div>
              <h2>Ceritakan pengalamanmu.</h2>
              <p>
                Kirim review lewat WhatsApp. Review terbaik akan kami tampilkan di halaman ini dan
                media sosial.
              </p>
            </div>
            <Link
              href={whatsappUrl('Halo RotiRumah, saya ingin mengirim review pesanan saya.')}
              target="_blank"
              rel="noreferrer"
              className="btn btn-brown"
            >
              Kirim review
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
