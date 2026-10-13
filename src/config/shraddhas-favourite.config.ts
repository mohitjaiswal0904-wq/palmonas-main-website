export const SHRADDHAS_FAVOURITE_HANDLE = 'shraddhas-favourite';

export const SHRADDHAS_LOOK_COLLECTION_HANDLE = 'shraddha-look';

export const SHRADDHAS_FAVOURITE_PAGE_PATH = '/shraddhas-favourite';

function shraddhasFavouriteAsset(fileName: string): string {
  return `/images/${encodeURI(`shraddhas-favourite/${fileName}`)}`;
}

export const shraddhasFavouriteImages = {
  heroMobile: shraddhasFavouriteAsset('App.jpg'),
  heroDesktop: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/SK_web_banner-f8fe160d.jpg',
  storyTitle: shraddhasFavouriteAsset('story-title.png'),
  storyScallopBorder: shraddhasFavouriteAsset('story-scallop-border.png'),
  categories: {
    rings: shraddhasFavouriteAsset('ring.jpeg'),
    necklaces: shraddhasFavouriteAsset('necklace.jpeg'),
    bracelets: shraddhasFavouriteAsset('bracelet.jpeg'),
    earrings: shraddhasFavouriteAsset('earring.jpeg'),
  },
  looks: [
    shraddhasFavouriteAsset('PAL_SHRADDHA_230524_2027-copy.jpg'),
    shraddhasFavouriteAsset('look 3 shrdh.jpg'),
    shraddhasFavouriteAsset('PAL_SHRADDHA_230524_8367-copy (1).jpg'),
    shraddhasFavouriteAsset('image00001.jpeg'),
  ],
} as const;

export interface ShraddhasFavouriteCategory {
  label: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export const shraddhasFavouriteCategories: ShraddhasFavouriteCategory[] = [
  {
    label: 'Rings',
    href: '/collections/shraddhas-favourite-rings',
    imageSrc: shraddhasFavouriteImages.categories.rings,
    imageAlt: 'Shraddha favourite rings',
  },
  {
    label: 'Necklaces',
    href: '/collections/shraddhas-favourite-necklaces',
    imageSrc: shraddhasFavouriteImages.categories.necklaces,
    imageAlt: 'Shraddha favourite necklaces',
  },
  {
    label: 'Bracelets',
    href: '/collections/shraddhas-favourite-bracelets',
    imageSrc: shraddhasFavouriteImages.categories.bracelets,
    imageAlt: 'Shraddha favourite bracelets',
  },
  {
    label: 'Earrings',
    href: '/collections/shraddhas-favourite-earrings',
    imageSrc: shraddhasFavouriteImages.categories.earrings,
    imageAlt: 'Shraddha favourite earrings',
  },
];

export interface ShraddhasFavouriteStoryItem {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export const shraddhasFavouriteStoryItems: ShraddhasFavouriteStoryItem[] = [
  {
    title: 'The First Time',
    description: "Shraddha's first Palmonas moment felt light, minimal, and effortless",
    ctaLabel: "Explore Shraddha's First Picks",
    href: '/collections/the-first-time',
    imageSrc: shraddhasFavouriteAsset('milestone-the-first-time.png'),
    imageAlt: 'Shraddha Kapoor milestone — The First Time',
  },
  {
    title: 'Why It Felt Right',
    description: 'Jewellery designed to blend into everyday life.',
    ctaLabel: 'Shop Everyday Jewellery',
    href: '/collections/why-it-felt-right',
    imageSrc: shraddhasFavouriteAsset('milestone-why-it-felt-right.png'),
    imageAlt: 'Shraddha Kapoor milestone — Why It Felt Right',
  },
  {
    title: "Jewellery That's So Her",
    description: 'Clean silhouettes and subtle shine, just her style',
    ctaLabel: "See Shraddha's Style",
    href: '/collections/jewellery-thats-so-her',
    imageSrc: shraddhasFavouriteAsset('milestone-jewellery-thats-so-her.png'),
    imageAlt: "Shraddha Kapoor milestone — Jewellery That's So Her",
  },
  {
    title: 'Gifts That Felt Personal',
    description: 'For Shraddha, jewellery carries emotion and turns special moments into memories',
    ctaLabel: 'Gift Like Shraddha',
    href: '/collections/gifts-that-felt-personal',
    imageSrc: shraddhasFavouriteAsset('milestone-gifts-that-felt-personal.png'),
    imageAlt: 'Shraddha Kapoor milestone — Gifts That Felt Personal',
  },
];
