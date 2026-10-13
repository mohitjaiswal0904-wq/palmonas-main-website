import { siteConfig } from '@/config/site.config';

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': siteConfig.name,
    'url': siteConfig.url,
    'logo': `${siteConfig.url}/images/logo.png`,
    'sameAs': ['https://www.instagram.com/palmonas', 'https://www.facebook.com/palmonas'],
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': siteConfig.name,
    'url': siteConfig.url,
    'description': siteConfig.description,
    'inLanguage': siteConfig.locale,
  };
}

export function buildProductJsonLd(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.image,
    'url': product.url,
    'brand': {
      '@type': 'Brand',
      'name': siteConfig.name,
    },
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'INR',
      'price': product.price,
      'availability': 'https://schema.org/InStock',
      'url': product.url,
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  };
}
