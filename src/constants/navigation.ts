/**
 * Header navigation configuration: top-level nav items and their dropdown /
 * mega-menu contents. Kept as data (separate from the Header UI) so menus can
 * be edited without touching component markup.
 *
 * Links resolve to `/collection/{handle}`, where the handle maps to a real
 * Shopify collection served by the backend collections API.
 */

export type DropdownOption = {
  label: string;
  href: string;
};

export type DropdownGroup = {
  title: string;
  options: DropdownOption[];
};

export type NavItem = {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownOption[];
  dropdownGroups?: DropdownGroup[];
};

/**
 * Map a human label to a real backend collection handle. Only labels whose
 * slug differs from the actual handle need an entry here — everything else is
 * resolved by `slugify`, which already matches the live handles (verified
 * against the collections API).
 */
const HANDLE_BY_LABEL: Record<string, string> = {
  // Category
  "Hair Accessories": "hair-accessories-collection",
  Mangalsutras: "diamond-mangalsutra",
  "Necklaces & Chains": "necklaces",
  Necklaces: "necklaces",
  // Collection
  "Emily In Paris": "emily-paris-collection",
  "On You Collection": "on-you",
  // Occasion
  "Party Wear": "party-wear-gold-jewellery",
  "Valentine's Special": "valentines-special",
  "Carnival Edit": "carnival-collection",
  // Gifting
  "Gift Card": "gifts",
  "Corporate Gifting": "cxo-collection",
  "Mother's Special": "gift-for-mom",
};

/** Slugify any label that isn't in the explicit handle map. */
const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Resolve a label to its collection route. */
const hrefFor = (label: string) =>
  `/collection/${HANDLE_BY_LABEL[label] ?? slugify(label)}`;

/** Turn a list of labels into dropdown options linked to their collections. */
const toOptions = (labels: string[]): DropdownOption[] =>
  labels.map((label) => ({ label, href: hrefFor(label) }));

const demifineMenu: DropdownGroup[] = [
  {
    title: "Gender",
    options: [
      { label: "Men", href: "/demifine" },
      { label: "Women", href: "/demifine" },
    ],
  },
  {
    title: "Category",
    options: [
      { label: "All Category", href: "/collection" },
      ...toOptions([
        "Anklets",
        "Bracelets",
        "Earrings",
        "Hair Accessories",
        "Mangalsutras",
        "Necklaces & Chains",
        "Rakhi",
        "Rings",
      ]),
    ],
  },
  {
    title: "Collection",
    options: toOptions([
      "AM To PM Collection",
      "Emily In Paris",
      "Evil Eye Collection",
      "Forever Casual",
      "Ombre Collection",
      "On You Collection",
      "Signature Collection",
    ]),
  },
  {
    title: "Occasion",
    options: toOptions([
      "Festive Collection",
      "Office Wear",
      "Party Wear",
      "Vacay Mode",
      "Valentine's Special",
      "Wedding Collection",
      "Carnival Edit",
    ]),
  },
  { title: "Offers", options: toOptions(["Buy 1 Get 1 Free"]) },
];

const giftingMenu: DropdownOption[] = toOptions([
  "Gifts for Her",
  "Gifts for Him",
  "Gift Card",
  "Corporate Gifting",
  "Mother's Special",
]);

const moreMenu: DropdownOption[] = [
  { label: "About Us", href: "#" },
  { label: "Blogs", href: "#" },
  { label: "Contact Us", href: "#" },
  { label: "Support", href: "#" },
  { label: "Career", href: "#" },
  { label: "Stores & Services", href: "#" },
];

export const navItems: NavItem[] = [
  { label: "New Arrivals", href: "/collection/new-arrivals" },
  { label: "Best Sellers", href: "/collection/best-sellers" },
  { label: "Offers", href: "/collection/sale" },
  {
    label: "Demi-fine Jewellery",
    href: "/demifine",
    hasDropdown: true,
    dropdownGroups: demifineMenu,
  },
  { label: "Emily In Paris", href: "/collection/emily-paris-collection" },
  { label: "Shraddha's Favourite", href: "/collection/shraddhas-favourite" },
  {
    label: "Gifting",
    href: "/collection/gifts",
    hasDropdown: true,
    dropdownItems: giftingMenu,
  },
  { label: "POP", href: "/pop" },
  {
    label: "More",
    href: "#",
    hasDropdown: true,
    dropdownItems: moreMenu,
  },
];
