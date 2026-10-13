// Data for the drawer menu items - Each category has specific layout and items

import type {
  DrawerHomeType,
  DrawerMenuCategory,
  DrawerMenuForHomeType,
  DrawerPriceRange,
  DrawerTab,
} from '@/types/drawer-menu';

// Promotional banners for "Limited Time Offers"
export const promoBanners = [
  {
    id: 'indi-collection',
    imageUrl:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/5c5954f475273b0d66d941b1fb3931d4e8d61240.png?v=1767788206',
    title: 'Indi Collection',
    handle: 'indi-collection',
  },
  {
    id: 'flat-50',
    imageUrl:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/b24eed05652f38867a83367488c04a6693dcadf2.png?v=1767788206',
    title: 'Flat 50%',
    handle: 'sale',
  },
  {
    id: 'mega-sale',
    imageUrl:
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/cf8d2aa6b31bc362e45c29fef15c56a6466371e3.png?v=1767788206',
    title: 'Mega Sale',
    handle: 'mega-sale',
  },
];

// Menu categories for Demi-Fine Jewellery
// Each category has a specific layout type that matches the screenshots
export const demiFineCategories: DrawerMenuCategory[] = [
  // CATEGORY: 3-column grid with square cards
  {
    id: 'category',
    label: 'Category',
    layoutType: 'grid-3',
    hasViewAll: true,
    viewAllHandle: 'all-products',
    items: [
      {
        id: 'rings-cat',
        label: 'Rings',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Rings-b4b2ef0c.png',
        handle: 'rings',
      },
      {
        id: 'mangalsutra-cat',
        label: 'Mangalsutras',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/mangalsutra-ca19b2ed.png',
        handle: 'mangalsutra',
      },
      {
        id: 'bracelets-cat',
        label: 'Bracelets',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Bracelets-444071b3.png',
        handle: 'bracelets',
      },
      {
        id: 'earrings-cat',
        label: 'Earrings',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Earrings-fa4cc44a.png',
        handle: 'earrings',
      },
      {
        id: 'mens-cat',
        label: 'Mens',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Mens-6160557a.png',
        handle: 'mens-collection',
      },
      {
        id: 'necklaces-cat',
        label: 'Necklaces',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Necklaces-49f9f388.png',
        handle: 'necklaces',
      },
    ],
  },
  // GENDER: 3-column grid with people images
  {
    id: 'gender',
    label: 'Gender',
    layoutType: 'grid-3',
    items: [
      {
        id: 'woman',
        label: 'Women',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Women-575267ef.png',
        handle: 'womens-collection',
      },
      {
        id: 'men',
        label: 'Men',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Mens-053c2b84.png',
        handle: 'mens-collection',
      },
    ],
  },
  // COLLECTION: 3-column grid
  {
    id: 'collection',
    label: 'Collection',
    layoutType: 'grid-3',
    items: [
      {
        id: 'new-arrivals',
        label: 'New Arrivals',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/New Arrivals-9d1668d3.png',
        handle: 'new-arrivals',
      },
      {
        id: 'best-sellers',
        label: 'Best Sellers',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Best Sellers-90e3ba73.png',
        handle: 'best-sellers',
      },
      {
        id: 'fine-silver',
        label: 'Fine Silver',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Fine Silver-e70e3491.png',
        handle: 'silver-luxe',
      },
      {
        id: 'emily-in-paris',
        label: 'Emily in Paris',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/04/Emily_In_Paris-da0d5fd4.png',
        handle: 'emily-paris-collection',
      },
      {
        id: 'shraddha-fav',
        label: "Shraddha's fav",
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Shraddhas fav-d89b1a27.png',
        handle: 'shraddhas-favourite',
      },
      {
        id: 'kids',
        label: 'Kids',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Kids-02f0f170.png',
        handle: 'kids-collection',
      },
    ],
  },
  // OCCASSION: Full-width banner list (vertical stacked banners)
  {
    id: 'occassion',
    label: 'Occassion',
    layoutType: 'banner-list',
    /** Temporarily hidden in Demi-Fine left nav; keep data for re-enable. */
    hiddenInSidebar: true,
    items: [
      {
        id: 'diwali-1',
        label: 'Diwali Collection',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/01/diwali-collection-c2d8069e.png',
        handle: 'diwali-collection-1',
      },
      {
        id: 'diwali-2',
        label: 'Office Wear',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/01/diwali-collection-c2d8069e.png',
        handle: 'office-wear',
      },
      {
        id: 'diwali-3',
        label: 'Party Wear',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/01/diwali-collection-c2d8069e.png',
        handle: 'date-night',
      },
      {
        id: 'diwali-4',
        label: 'Vacay Mode',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/01/diwali-collection-c2d8069e.png',
        handle: 'vacay-mode',
      },
      {
        id: 'diwali-5',
        label: "Valentine's Special",
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/01/diwali-collection-c2d8069e.png',
        handle: 'valentines-special',
      },
      {
        id: 'diwali-6',
        label: 'Wedding Collection',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/01/diwali-collection-c2d8069e.png',
        handle: 'wedding-collection',
      },
      {
        id: 'diwali-7',
        label: 'Festive Special',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/01/diwali-collection-c2d8069e.png',
        handle: 'carnival-collection',
      },
    ],
  },
  // STYLE: 2-column + banner mixed layout
  // Temporarily hidden
  {
    id: 'style',
    label: 'Style',
    layoutType: 'grid-2-banner',
    items: [
      {
        id: 'party-wear-style',
        label: 'Party Wear',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Party Wear-c10aea1d.png',
        handle: 'date-night',
      },
      {
        id: 'date-night-style',
        label: 'Date Night',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Date Night-350711e2.png',
        handle: 'date-night',
      },
      {
        id: 'wedding-style',
        label: 'Wedding Wear',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Wedding Wear-1eeb21c8.png',
        handle: 'wedding-collection',
        isFullWidth: true,
      },
      {
        id: 'day-out-style',
        label: 'Day Out',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Day Out-99527646.png',
        handle: 'vacay-mode',
      },
      {
        id: 'daily-wear-style',
        label: 'Daily Wear',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Daily Wear-746bb144.png',
        handle: 'office-wear',
      },
    ],
  },
  // GIFTING: 2-column + full-width "Season of Giving" banner
  {
    id: 'gifting',
    label: 'Gifting',
    layoutType: 'grid-2-banner',
    items: [
      {
        id: 'gifts-for-her',
        label: 'Gifts for Her',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Gifts_for_her-4d365fed.png',
        handle: 'gifts-for-her',
      },
      {
        id: 'gifts-for-him',
        label: 'Gifts for Him',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Gifts_for_fim-92e37a5b.png',
        handle: 'gifts-for-him',
      },
      {
        id: 'season-of-giving',
        label: 'Season of Giving',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/season_of_giving-2556af3a.png',
        handle: 'gifts',
        isFullWidth: true,
      },
    ],
  },
  // FINE SILVER: same layout as Gifting — 2 up + full-width
  {
    id: 'fine-silver',
    label: 'Fine Silver',
    labelBadge: { text: 'Luxe' },
    hasViewAll: true,
    viewAllHandle: 'fine-silver',
    // layoutType: 'grid-2-banner',
    layoutType: 'grid-3',
    items: [
      {
        id: 'silver-luxe-ring',
        label: 'Silver ring',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/09/Rectangle-27-239af3a3.jpg',
        handle: 'silver-rings',
      },
      {
        id: 'silver-mangalsutras',
        label: 'Mangalsutras.',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/09/Rectangle-27-35d85a6c.jpg',
        handle: 'silver-mangalsutras',
      },
      {
        id: 'silver-bracelets',
        label: 'Bracelets',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/09/Rectangle-27-f0eb42da.jpg',
        handle: 'silver-bracelets',
      },
      {
        id: 'silver-earrings',
        label: 'Earrings',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/09/Rectangle-27-276601eb.jpg',
        handle: 'silver-earrings',
      },
      {
        id: 'silver-necklaces',
        label: 'Necklaces',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/09/Rectangle-27-7c675137.jpg',
        handle: 'silver-necklaces',
      },
      {
        id: 'silver-mens',
        label: 'Men',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/09/Rectangle-27-91b3a3dc.jpg',
        handle: 'mens-silver-collection',
      },
    ],
  },
  {
    id: 'fine-silver-collection',
    label: 'Fine Silver Collection',

    // labelBadge: { text: 'Luxe' },
    layoutType: 'grid-2-banner',
    items: [
      {
        id: 'silver-luxe',
        label: 'Silver Luxe',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/04/Silver_Luxe-84fedeb9.png',
        handle: 'silver-luxe',
      },
      {
        id: 'monday-collection',
        label: 'Monday Coll.',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/04/Monday_Collection-c73064e2.png',
        handle: 'monday-collection',
      },
      {
        id: 'supernova-collection',
        label: 'Supernova Collection',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/04/Supernova_Collection-b0a7ffdb.png',
        handle: 'supernova-collection',
        isFullWidth: true,
      },
      {
        id: 'play-collection',
        label: 'Play Collection',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/08/Frame 2613427-367185ae.png',
        handle: 'play-collection',
      },
      {
        id: 'ode-to-nature',
        label: 'Ode to Nature',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/08/Frame 2613426-87efcefb.png',
        handle: 'ode-to-nature',
      },
    ],
  },
];

// Bottom items for Demi-Fine (with external link icons)
export const demiFineBottomItems = [
  { id: 'diwali', label: 'Diwali', hasExternalIcon: true, handle: 'diwali' },
  {
    id: 'Platinum Plated Silver',
    label: 'Platinum Plated Silver',
    hasExternalIcon: true,
    handle: 'platinum-plated-silver',
  },
  {
    id: 'palmonas-in-style-with-tanya-ghavri',
    label: 'Tanya Ghavri',
    hasExternalIcon: true,
    handle: 'palmonas-in-style-with-tanya-ghavri',
  },
  { id: 'new-arrival', label: 'New Arrivals', hasExternalIcon: true, handle: 'new-arrivals' },
  { id: 'best-sellers', label: 'Best Sellers', hasExternalIcon: true, handle: 'best-sellers' },
];

// Menu categories for Gold Jewellery
export const goldCategories: DrawerMenuCategory[] = [
  // CATEGORY: 3-column grid for Gold
  {
    id: 'category',
    label: 'Category',
    layoutType: 'grid-3',
    hasViewAll: true,
    viewAllHandle: '9kt-fine-gold',
    items: [
      {
        id: 'rings-cat',
        label: 'Rings',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Rings-28bd5614.png',
        handle: '9kt-gold-rings',
      },
      {
        id: 'earrings-cat',
        label: 'Earrings',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Earrings-16ead2a1.png',
        handle: '9kt-gold-earrings',
      },
      {
        id: 'pendants-cat',
        label: 'Pendants',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Pendants-8d2429c6.png',
        handle: '9kt-gold-pendants',
      },
      {
        id: 'bracelets-cat',
        label: 'Bracelets',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Bracelets-f4980480.png',
        handle: '9kt-gold-bracelets',
      },
      {
        id: 'mangalsutras-cat',
        label: 'Mangalsutras',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Mangalsutras-7fd242c9.png',
        handle: '9kt-gold-mangalsutra',
      },
      {
        id: 'necklaces-cat',
        label: 'Necklaces',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Necklaces-944d5f6d.png',
        handle: '9kt-gold-necklaces',
      },
    ],
  },
  // PRICE: Uses price range checkboxes
  {
    id: 'price',
    label: 'Price',
    layoutType: 'price-range',
    items: [], // Price uses ranges instead
  },
  // STYLE: 2-column + banner for Gold
  {
    id: 'style',
    label: 'Style',
    layoutType: 'grid-2-banner',
    items: [
      {
        id: 'daily-wear-gold',
        label: 'Daily Wear',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/04/Daily_Wear-ce405bba.png',
        handle: 'everyday-gold-jewellery',
      },
      {
        id: 'office-wear-gold',
        label: 'Office Wear',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/04/Office_Wear-f7713c9e.png',
        handle: 'minimal-gold-jewellery',
      },
      {
        id: 'special-occasion-gold',
        label: 'Special Occasion',
        imageUrl:
          'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/04/Special_Occasion-a7ef67c2.png',
        handle: '9kt-engagement-rings',
      },
      {
        id: 'wedding-gold',
        label: 'Wedding',
        imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/04/Wedding-99f8a35d.png',
        handle: '9kt-gold-mangalsutra',
      },
    ],
  },
];

// Price ranges for Gold Jewellery
export const goldPriceRanges: DrawerPriceRange[] = [
  {
    id: 'price-under-10k',
    label: 'Under 10k',
    handle: 'gold-under-10k',
    min: 0,
    max: 10000,
    imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/02/Under 10k-005f374f.png',
  },
  {
    id: 'price-under-20k',
    label: 'Under 20k',
    handle: 'gold-less-than-20k',
    min: 0,
    max: 20000,
    imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/02/Under 20k -30e2929c.png',
  },
  {
    id: 'price-above-20k',
    label: 'Above 20k',
    handle: 'gold-greater-than-20k',
    min: 20000,
    max: null,
    imageUrl: 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/03/Above 20k-3a46e8b1.png',
    isFullWidth: true,
  },
];

// Bottom items for Gold (with external link icons)
// Temporarily hidden
type GoldBottomItem = {
  id: string;
  label: string;
  hasExternalIcon?: boolean;
  handle?: string;
};

export const goldBottomItems: GoldBottomItem[] = [];

// Segmented control tabs at the top of the drawer (Figma 960:32123)
// ponytail: Silver tab hidden for now — re-add `{ id: 'silver', ... }` when silver drawer content ships.
export const drawerTabs: DrawerTab[] = [
  { id: 'demifine', label: 'Demifine®', ariaLabel: 'Demifine® Jewellery' },
  { id: 'gold', label: 'Gold', ariaLabel: 'Gold Jewellery' },
];

// Menu data rendered for each drawer tab
// ponytail: silver reuses the demi-fine dataset until silver-specific drawer content exists —
// swap in a `silverCategories` list here when the CMS provides one.
export const drawerMenusByHomeType: Record<DrawerHomeType, DrawerMenuForHomeType> = {
  demifine: { categories: demiFineCategories, bottomItems: demiFineBottomItems },
  gold: { categories: goldCategories, bottomItems: goldBottomItems },
  silver: { categories: demiFineCategories, bottomItems: demiFineBottomItems },
};
// export const goldBottomItems = [
//     { id: 'new-arrival', label: 'New Arrival', hasExternalIcon: true, handle: ' mto' },
//     {
//       id: 'best-sellers',
//       label: 'Best Sellers',
//       hasExternalIcon: true,
//       handle: 'gold-best-sellers',
//     },
// ];
