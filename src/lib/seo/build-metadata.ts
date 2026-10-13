import type { Metadata } from 'next';

import { siteConfig } from '@/config/site.config';

export interface PageMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
}

function resolveCanonicalUrl(path = ''): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath === '/' ? '' : normalizedPath}`;
}

function resolveOgImage(image?: string): string {
  const imagePath = image ?? siteConfig.ogImage.url;
  return imagePath.startsWith('http') ? imagePath : `${siteConfig.url}${imagePath}`;
}

/** Builds Next.js Metadata for a page with Palmonas SEO defaults. */
export function buildMetadata(options: PageMetadataOptions = {}): Metadata {
  const {
    title,
    description = siteConfig.description,
    path = '',
    ogImage,
    noIndex = false,
    keywords = [...siteConfig.keywords],
  } = options;

  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const canonicalUrl = resolveCanonicalUrl(path);
  const openGraphImage = resolveOgImage(ogImage);

  return {
    title: title ? pageTitle : { default: siteConfig.title, template: `%s | ${siteConfig.name}` },
    description,
    keywords,
    authors: [{ name: siteConfig.creator, url: siteConfig.url }],
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: canonicalUrl,
      siteName: siteConfig.name,
      title: pageTitle,
      description,
      images: [
        {
          url: openGraphImage,
          width: siteConfig.ogImage.width,
          height: siteConfig.ogImage.height,
          alt: siteConfig.ogImage.alt,
        },
      ],
    },
    twitter: {
      card: siteConfig.twitter.card,
      site: siteConfig.twitter.handle,
      creator: siteConfig.twitter.handle,
      title: pageTitle,
      description,
      images: [openGraphImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}
