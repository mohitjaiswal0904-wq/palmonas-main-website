export const EMILY_IN_PARIS_PAGE_PATH = '/emily-in-paris';

/** Shopify collection handle for Emily in Paris products. */
export const EMILY_IN_PARIS_COLLECTION_HANDLE = 'emily-paris-collection';

const EMILY_IN_PARIS_ASSET_DIR = 'Emilyt in paris';

function emilyInParisAsset(fileName: string): string {
  return `/images/${encodeURI(`${EMILY_IN_PARIS_ASSET_DIR}/${fileName}`)}`;
}

export const emilyInParisHashtags = [
  '#ForTheEmilyInYou',
  '#EmilyInParis',
  '#PalmonasXEmily',
  '#ParisianChic',
  '#LuxeLobeLove',
  '#RingADingParis',
] as const;

export interface EmilyInParisLookImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const emilyInParisImages = {
  hero: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/Web%20Banner%20V2-b536b95b.jpg',
  heroVideo: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/EMILY%20BANNER-5157ea5d.mp4',
  looks: [
    {
      src: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/6-864a9cc0.jpg',
      alt: 'Emily in Paris styled look 1',
      width: 257,
      height: 386,
    },
    {
      src: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/2-538254fd.jpg',
      alt: 'Emily in Paris styled look 2',
      width: 257,
      height: 386,
    },
    {
      src: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/3-36524c82.jpg',
      alt: 'Emily in Paris styled look 3',
      width: 257,
      height: 386,
    },
    {
      src: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/5-57bf75ce.jpg',
      alt: 'Emily in Paris styled look 4',
      width: 257,
      height: 386,
    },
    {
      src: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/4-3b6157ea.jpg',
      alt: 'Emily in Paris styled look 5',
      width: 257,
      height: 386,
    },
    {
      src: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/1-6053aba7.jpg',
      alt: 'Emily in Paris styled look 6',
      width: 257,
      height: 386,
    },
  ] satisfies EmilyInParisLookImage[],
} as const;

export interface EmilyInParisCategory {
  label: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export const emilyInParisCategories: EmilyInParisCategory[] = [
  {
    label: 'Parisian Pendants',
    href: '/collections/parisian-pendants',
    imageSrc: emilyInParisAsset('PMW01NC074.webp'),
    imageAlt: 'Parisian pendants from Emily in Paris',
  },
  {
    label: 'Wrist of Chic',
    href: '/collections/wrist-of-chic',
    imageSrc: emilyInParisAsset('PMW01BR034_Bracelet.webp'),
    imageAlt: 'Wrist of Chic bracelets from Emily in Paris',
  },
  {
    label: 'Luxe Lobe Love',
    href: '/collections/luxe-lobe-love',
    imageSrc: emilyInParisAsset('PMW01ER157_earring.webp'),
    imageAlt: 'Luxe Lobe Love earrings from Emily in Paris',
  },
  {
    label: 'Ring-a-Ding Paris',
    href: '/collections/ring-a-ding-paris',
    imageSrc: emilyInParisAsset('PMW01RG005.webp'),
    imageAlt: 'Ring-a-Ding Paris rings from Emily in Paris',
  },
  {
    label: 'Haute Hair Affair',
    href: '/collections/haute-hair-affair',
    imageSrc: emilyInParisAsset('PMW01HA003_bedz.jpg'),
    imageAlt: 'Haute Hair Affair accessories from Emily in Paris',
  },
];
