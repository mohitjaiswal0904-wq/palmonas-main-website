/**
 * Custom `next/image` loader — browser requests the CDN URL directly.
 * Avoids proxying Shopify/OMS/CloudFront bytes through `/_next/image` on this origin.
 *
 * @param src - Absolute remote asset URL (or same-origin path)
 * @param width - Requested display width from next/image
 * @param quality - Optional JPEG/WebP quality (Shopify honours this)
 * @returns Final browser-facing URL
 */
export default function cdnImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  try {
    const url = new URL(src);

    if (url.hostname === 'cdn.shopify.com' || url.hostname.endsWith('.myshopify.com')) {
      url.searchParams.set('width', String(width));
      url.searchParams.set('quality', String(quality ?? 75));
      return url.href;
    }

    // next/image custom loaders must include `width` in the returned URL.
    url.searchParams.set('w', String(width));
    if (quality != null) {
      url.searchParams.set('q', String(quality));
    }
    return url.href;
  } catch {
    // Relative / public paths — leave unchanged
    return src;
  }
}
