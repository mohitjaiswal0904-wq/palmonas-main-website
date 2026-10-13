import Image from 'next/image';

interface DrawerImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Prefer true for tiles in the first viewport when the menu opens. */
  priority?: boolean;
  sizes?: string;
}

/**
 * Render a drawer menu image via next/image.
 * `unoptimized` keeps the raw CDN URL so prefetch + visit share one HTTP cache key
 * (custom loader `?w=` srcset otherwise misses the warm cache on Fast 4G).
 *
 * @param src - Remote CDN URL (CloudFront / Shopify)
 * @param alt - Accessible alt text
 * @param className - Tailwind classes (typically `h-full w-full object-cover`)
 * @param priority - Eager/high-priority fetch for above-the-fold tiles
 * @param sizes - Unused when unoptimized; kept for call-site compatibility
 */
export function DrawerImage({
  src,
  alt,
  className,
  priority = false,
  sizes: _sizes = '(max-width: 768px) 45vw, 240px',
}: DrawerImageProps) {
  if (!src.trim()) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={400}
      unoptimized
      priority={priority}
      className={className}
    />
  );
}
