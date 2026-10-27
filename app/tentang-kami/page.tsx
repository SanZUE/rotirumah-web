import Link from 'next/link';
import type { Metadata } from 'next';
import { Picture } from '@/components/Picture';
import { Reveal } from '@/components/Reveal';
import { site } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description:
    'RotiRumah adalah usaha roti rumahan yang membuat bolen, bomboloni, dan roti sobek fresh setiap hari dengan proses yang dekat dan personal.',
  alternates: { canonical: '/tentang-kami/' },
  openGraph: {
    title: `Tentang Kami · ${site.name}`,
    description: 'Dari dapur kecil, untuk kebahagiaan sehari-hari.',
    url: '/tentang-kami/',
  },
};

const points = [
  { title: '100% rumahan', text: 'Dibuat dengan perhatian pada detail kecil.' },
  { title: 'Fresh setiap hari', text: 'Memprioritaskan kualitas dan tekstur.' },
  { title: 'Custom request', text: 'Lebih mudah disesuaikan untuk acara.' },
  { title: 'Hangat & personal', text: 'Komunikasi dekat lewat WhatsApp.' },
];

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Cerita kami</div>
          <h1>Tentang RotiRumah</h1>
          <p>Roti rumahan yang berangkat dari kecintaan pada roti, keluarga, dan momen sederhana.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 25 }}>
        <div className="container story">
          <Picture
            slug="dapur"
            alt="Meja dapur dengan roti yang baru dipanggang, tepung, dan rolling pin"
            className="story-media"
            sizes="(max-width: 940px) 100vw, 560px"
            ratio={4 / 3}
          />
          <Reveal>
            <h2 className="display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginTop: 0 }}>
              Dari dapur kecil, untuk kebahagiaan sehari-hari.
            </h2>
            <p className="prose" style={{ marginTop: 14 }}>
              RotiRumah hadir dengan satu tujuan sederhana: membuat roti yang terasa seperti dibuat
              untuk orang rumah sendiri. Kami menjaga proses tetap dekat, fresh, dan fleksibel —
              termasuk menerima permintaan khusus untuk acara keluarga.
            </p>
            <div className="bullets">
              {points.map((point) => (
                <div className="bullet" key={point.title}>
                  <b>{point.title}</b>
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
            <div className="hero-actions" style={{ marginTop: 22 }}>
              <Link href="/menu" className="btn btn-brown">
                Lihat menu
              </Link>
              <Link href="/kontak" className="btn btn-ghost">
                Hubungi kami
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
