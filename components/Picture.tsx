import { preload } from 'react-dom';
import { getImage } from '@/lib/images.generated';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

function url(slug: string, width: number, ext: 'avif' | 'webp' | 'jpg'): string {
  return `${BASE_PATH}/img/${slug}-${width}.${ext}`;
}

export type PictureProps = {
  /** slug gambar di lib/images.generated.ts */
  slug: string;
  alt: string;
  /** atribut sizes untuk srcset; sesuaikan dengan lebar render */
  sizes?: string;
  className?: string;
  /** true untuk gambar LCP (hero): eager + fetchpriority high + preload */
  priority?: boolean;
  /** override rasio (mis. 16/9 untuk hero) */
  ratio?: number;
  style?: React.CSSProperties;
};

/**
 * Gambar responsif tanpa optimizer Next (karena `output: 'export'`).
 *
 * - `<picture>` dengan AVIF → WebP → JPG
 * - `srcset` 4 lebar, `width`/`height` eksplisit (anti-CLS)
 * - LQIP base64 sebagai latar sebelum gambar ter-decode
 * - `priority` menambahkan preload + fetchpriority=high
 *
 * Tidak memakai state/efek, jadi aman dipakai di server maupun client component.
 */
export function Picture({
  slug,
  alt,
  sizes = '(max-width: 560px) 100vw, (max-width: 940px) 50vw, 33vw',
  className = '',
  priority = false,
  ratio,
  style,
}: PictureProps) {
  const asset = getImage(slug);
  const aspect = ratio ?? asset?.aspect ?? 4 / 3;

  if (!asset) {
    // Degradasi anggun: blok warna dengan label aksesibel, bukan gambar rusak.
    return (
      <div
        className={`picture ${className}`}
        role="img"
        aria-label={alt}
        style={{ aspectRatio: aspect, background: 'var(--soft)', ...style }}
      />
    );
  }

  const { widths } = asset;
  const largest = widths[widths.length - 1];
  const jpgWidths = [...new Set([widths[0], largest])];

  const srcSet = (ext: 'avif' | 'webp') =>
    widths.map((width) => `${url(slug, width, ext)} ${width}w`).join(', ');
  const jpgSet = jpgWidths.map((width) => `${url(slug, width, 'jpg')} ${width}w`).join(', ');

  // Untuk gambar LCP: preload AVIF lewat resource API React supaya tag <link>
  // benar-benar ditempatkan di <head>, bukan di tengah <body>.
  if (priority) {
    preload(url(slug, largest, 'avif'), {
      as: 'image',
      type: 'image/avif',
      imageSrcSet: srcSet('avif'),
      imageSizes: sizes,
      fetchPriority: 'high',
    });
  }

  return (
    <div
      className={`picture ${className}`}
      style={{
        aspectRatio: aspect,
        backgroundColor: asset.color,
        backgroundImage: `url("${asset.lqip}")`,
        ...style,
      }}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
        <img
          src={url(slug, largest, 'jpg')}
          srcSet={jpgSet}
          sizes={sizes}
          alt={alt}
          width={largest}
          height={Math.round(largest / aspect)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </picture>
    </div>
  );
}
