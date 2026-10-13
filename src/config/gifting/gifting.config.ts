/**
 * Static copy and media for the public `/gifting` marketing page.
 * Links point at collection/search routes; no API calls on this page.
 */

function giftingAsset(subdir: string, fileName: string): string {
  return `/images/${encodeURI(`${subdir}/${fileName}`)}`;
}

function shraddhaAsset(fileName: string): string {
  return giftingAsset('shraddhas-favourite', fileName);
}

function emilyAsset(fileName: string): string {
  return giftingAsset('Emilyt in paris', fileName);
}

export const GIFTING_HERO = {
  mobileImageSrc:
    'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/First_Banner.jpg?v=1785443357',
  desktopImageSrc:
    'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/First_Hero_Banner.png?v=1785482372',
  offerLabel: '25% OFF',
  offerSubLabel: 'For Timeless Gifting',
  title: 'Thoughtful Gifts, Curated with Love',
  description: 'Stress-free gifting with perfectly curated jewellery sets.',
  ctaLabel: 'Find the Perfect Gift',
  ctaHref: '/collections/gifts-for-her',
  imageAlt: 'Gift boxes wrapped with gold ribbons for Palmonas gifting',
} as const;

export interface GiftingShopCard {
  id: string;
  title: string;
  imageSrc: string;
  mobileImageSrc?: string;
  desktopImageSrc?: string;
  imageAlt: string;
  href: string;
  ctaLabel?: string;
}

export const GIFTING_PALMONAS_GIFTS: readonly GiftingShopCard[] = [
  {
    id: 'jewellery',
    title: 'Palmonas Jewellery',
    imageSrc: shraddhaAsset('ring.jpeg'),
    mobileImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Palmonas_jewellery.png?v=1785444076',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Palmonas_jewellery_18ac2344-662a-44a7-9fe1-9f3125d7f2dc.png?v=1785482756',
    imageAlt: 'Stacked gold rings from Palmonas',
    href: '/collections/best-seller',
  },
  {
    id: 'bundles',
    title: 'Gift Bundles',
    imageSrc: shraddhaAsset('milestone-gifts-that-felt-personal.png'),
    mobileImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Gift_Bundles.png?v=1785444076',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Gift_Bundle.png?v=1785482757',
    imageAlt: 'Jewellery gift bundle basket',
    href: '/collections/gifts-for-her',
  },
  {
    id: 'budget',
    title: 'Budget Gifts',
    imageSrc: shraddhaAsset('necklace.jpeg'),
    mobileImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Budget_Gifts.png?v=1785444076',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Budget_Gifts_b3749d10-715e-4786-b32f-e23c489b5f0d.png?v=1785482757',
    imageAlt: 'Pendant necklaces for budget gifting',
    href: '/collections/under-inr-4999',
  },
] as const;

export const GIFTING_OCCASIONS = [
  {
    id: 'anniversary',
    title: 'Anniversary',
    imageSrc: shraddhaAsset('PAL_SHRADDHA_230524_2027-copy.jpg'),
    mobileImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Anniversary.png?v=1785444738',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Anniversary_16497408-0d37-49a1-8306-0d662dc0fc03.png?v=1785487660',
    imageAlt: 'Anniversary jewellery look',
    href: '/collections/anniversary-sale',
  },
  {
    id: 'birthday',
    title: 'Birthday',
    imageSrc: shraddhaAsset('PAL_SHRADDHA_230524_8367-copy (1).jpg'),
    mobileImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Birthday_df7824bd-f551-4415-9f1d-327a683df38f.png?v=1785444738',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Birthday_03a61ebd-8db4-48bc-a4f0-7a6925d20d24.png?v=1785487659',
    imageAlt: 'Birthday jewellery look',
    href: '/collections/birthday-sale',
  },
  {
    id: 'festive',
    title: 'Festive',
    imageSrc: shraddhaAsset('image00001.jpeg'),
    mobileImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Festive.png?v=1785444737',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Festive_f32221a9-0311-4d3e-84d7-2735c4584818.png?v=1785487660',
    imageAlt: 'Festive jewellery look',
    href: '/collections/limited-time-festive-deals',
  },
  {
    id: 'just-because',
    title: 'Just Because',
    imageSrc: emilyAsset('Look_1_c14394b4-e56d-44fa-a48f-9c94abdfc0fe.webp'),
    mobileImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Just_Because.png?v=1785444737',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Just_Because_f1020874-00f6-4446-a0af-9b7894da06b6.png?v=1785487660',
    imageAlt: 'Everyday jewellery look',
    href: '/collections/best-seller',
  },
] as const satisfies readonly GiftingShopCard[];

export const GIFTING_CATEGORY_FILTERS = [
  { id: 'all', label: 'All', collectionHandle: 'best-sellers' },
  { id: 'rings', label: 'Rings', collectionHandle: 'rings' },
  { id: 'earrings', label: 'Earrings', collectionHandle: 'earrings' },
  { id: 'necklaces', label: 'Necklaces', collectionHandle: 'necklaces' },
  { id: 'bracelets', label: 'Bracelets', collectionHandle: 'bracelets' },
] as const;

/** Default (All) collection handle for the category products rail. */
export const GIFTING_CATEGORY_COLLECTION_HANDLE = GIFTING_CATEGORY_FILTERS[0].collectionHandle;

/** Page size for gifting category / collection products fetches. */
export const GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE = 12;

export interface GiftingStaticProduct {
  id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  priceLabel: string;
  compareAtPriceLabel: string;
  rating: string;
  reviewCount: string;
  offerLabel: string;
  isBestseller?: boolean;
}

export const GIFTING_CATEGORY_PRODUCTS: readonly GiftingStaticProduct[] = [
  {
    id: 'lunar-flow-1',
    name: 'Lunar Flow 9KT Gold Earrings',
    imageSrc: emilyAsset('PMW01ER157_earring.webp'),
    imageAlt: 'Lunar Flow gold hoop earrings',
    href: '/collections/all',
    priceLabel: '₹3,32,266',
    compareAtPriceLabel: '₹3,33,226',
    rating: '4.5',
    reviewCount: '125',
    offerLabel: 'Extra 25% OFF + 2 more',
    isBestseller: true,
  },
  {
    id: 'lunar-flow-2',
    name: 'Lunar Flow 9KT Gold Earrings',
    imageSrc: emilyAsset('PMW01ER157_earring.webp'),
    imageAlt: 'Lunar Flow gold hoop earrings',
    href: '/collections/all',
    priceLabel: '₹3,32,266',
    compareAtPriceLabel: '₹3,33,226',
    rating: '4.5',
    reviewCount: '125',
    offerLabel: 'Extra 25% OFF + 2 more',
    isBestseller: true,
  },
  {
    id: 'lunar-flow-3',
    name: 'Aura Bloom Ring',
    imageSrc: emilyAsset('PMW01RG005.webp'),
    imageAlt: 'Aura Bloom gold ring',
    href: '/collections/all',
    priceLabel: '₹1,24,990',
    compareAtPriceLabel: '₹1,32,990',
    rating: '4.7',
    reviewCount: '98',
    offerLabel: 'Extra 20% OFF + 1 more',
    isBestseller: true,
  },
] as const;

export const GIFTING_FREE_GIFTS = {
  title: 'Free Gifts',
  subtitle: 'With Every Order',
  ctaLabel: 'Shop Now',
  ctaHref: '/collections/gifts-for-her',
  mobileImageSrc:
    'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Free_Gifts.png?v=1785444077',
  desktopImageSrc:
    'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Free_Gifts_df481433-8230-4e30-8e91-c351a1d18005.png?v=1785486404',
  imageAlt: 'Diamond ring and necklace free gift showcase',
} as const;

export const GIFTING_GIFT_CARDS = {
  title: 'Gift Cards',
  ctaLabel: 'Send Smile',
  ctaHref: '/collections/best-seller',
  mobileImageSrc:
    'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Gift_Card.png?v=1785444077',
  desktopImageSrc:
    'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Gift_Cards.png?v=1785486404',
  imageAlt: 'Gold rings and bracelet gift card showcase',
} as const;

export const GIFTING_RELATIONSHIPS = {
  titlePrefix: 'Gifts As Precious As',
  titleHighlight: 'Your Relationships',
  subtitle: 'Made In Gold, Given With Love',
  cards: [
    {
      id: 'her',
      title: 'For Her',
      imageSrc: shraddhaAsset('earring.jpeg'),
      mobileImageSrc:
        'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/For_Her.png?v=1785445544',
      desktopImageSrc:
        'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/For_Her_a970e03f-1aad-46bd-82da-d47467ab11ea.png?v=1785486944',
      imageAlt: 'Jewellery gifts for her',
      href: '/collections/gifts-for-her',
    },
    {
      id: 'him',
      title: 'For Him',
      imageSrc: emilyAsset('PMW01BR034_Bracelet.webp'),
      mobileImageSrc:
        'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/For_Him.png?v=1785445544',
      desktopImageSrc:
        'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/For_Him_a3202c65-c860-43a8-827a-42681b8526aa.png?v=1785486944',
      imageAlt: 'Jewellery gifts for him',
      href: '/collections/gifts-for-him',
    },
    {
      id: 'friend',
      title: 'For Friend',
      imageSrc: shraddhaAsset('bracelet.jpeg'),
      mobileImageSrc:
        'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/For_Friend.png?v=1785445544',
      desktopImageSrc:
        'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/For_Friend_2b62d658-42f5-4481-9288-500db2ac187d.png?v=1785486944',
      imageAlt: 'Jewellery gifts for friends',
      href: '/collections/friendship-day-special',
    },
  ] as const satisfies readonly GiftingShopCard[],
} as const;

export interface GiftingPriceCard {
  id: string;
  label: string;
  href: string;
  mobileImageSrc: string;
  desktopImageSrc: string;
}

export const GIFTING_BY_PRICE: readonly GiftingPriceCard[] = [
  {
    id: 'under-2k',
    label: 'Under 2k',
    href: '/collections/under-2k',
    mobileImageSrc: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/2k.png?v=1785445938',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/2k_da69e4e8-d2d4-418c-8730-a67bd6aa06b8.png?v=1785487323',
  },
  {
    id: 'under-5k',
    label: 'Under 5k',
    href: '/collections/under-5k',
    mobileImageSrc: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/5k.png?v=1785445939',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/5k_86a49a6d-9a71-46a8-843d-cc743c193e4a.png?v=1785487323',
  },
  {
    id: 'above-10k',
    label: 'Above 10k',
    href: '/collections/above-10k',
    mobileImageSrc: 'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/10k.png?v=1785445937',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/10k_cb0c7a25-4430-47c3-bf9b-1afcce7fc1b3.png?v=1785487323',
  },
  {
    id: 'premium',
    label: 'Premium Gifts',
    href: '/collections/gifts-for-her',
    mobileImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Premium_Gifts.png?v=1785445939',
    desktopImageSrc:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Premium_Gifts_28fa9e5e-4e36-47b6-b474-44daeeea49a4.png?v=1785487323',
  },
] as const;

export const GIFTING_BESTSELLERS = {
  title: 'Demifine Bestsellers',
  /** Temporary working collection — swap when the demifine bestsellers handle is final. */
  collectionHandle: 'new-arrivals',
  viewAllLabel: 'View All',
} as const;

export const GIFTING_SECTION_TITLES = {
  palmonasGifts: 'Palmonas Gifts',
  shopByOccasion: 'Shop By Occasion',
  newYearByCategory: 'Palmonas Top Styles',
  giftsByPrice: 'Gifts By Price',
} as const;

export const GIFTING_CATEGORY_MESSAGES = {
  loadingProducts: 'Loading products…',
  viewAllLabel: 'View All',
} as const;

/** Decorative icon beside the “Gifts By Price” heading. */
export const GIFTING_BY_PRICE_ICON_SRC =
  'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/Gifts_by_price_icon_64926db4-bd2c-4361-a1f9-9359bb216351.png?v=1785446064';
