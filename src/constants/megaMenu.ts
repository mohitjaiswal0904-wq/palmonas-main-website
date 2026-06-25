/**
 * Data for the slide-out mega-menu (mobile nav drawer). Each tab (Demi-fine /
 * Gold) has a vertical rail of entries; "panel" entries reveal a grid of tiles
 * on the right, while "link" entries navigate directly.
 *
 * Links resolve to `/collection/{handle}` where the handle maps to a real
 * backend collection, mirroring the logic in `constants/navigation.ts`.
 */

export type MenuTile = { label: string; href: string };

export type MenuEntry = {
  key: string;
  label: string;
  /** Optional pill badge shown after the label (e.g. "Luxe"). */
  badge?: string;
} & (
  | { type: "panel"; tiles: MenuTile[]; viewAllHref?: string }
  | { type: "link"; href: string }
);

export type MenuTab = {
  key: "demifine" | "gold";
  label: string;
  entries: MenuEntry[];
};

const HANDLE_BY_LABEL: Record<string, string> = {
  Mangalsutras: "diamond-mangalsutra",
  Necklaces: "necklaces",
  "Emily In Paris": "emily-paris-collection",
  "On You Collection": "on-you",
  "Party Wear": "party-wear-gold-jewellery",
  "Valentine's Special": "valentines-special",
  "Carnival Edit": "carnival-collection",
  "Gift Card": "gifts",
  "Corporate Gifting": "cxo-collection",
  "Mother's Special": "gift-for-mom",
};

const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const hrefFor = (label: string) =>
  `/collection/${HANDLE_BY_LABEL[label] ?? slugify(label)}`;

const tiles = (labels: string[]): MenuTile[] =>
  labels.map((label) => ({ label, href: hrefFor(label) }));

export const menuTabs: MenuTab[] = [
  {
    key: "demifine",
    label: "Demi-fine Jewellery",
    entries: [
      {
        key: "category",
        label: "Category",
        type: "panel",
        tiles: tiles([
          "Rings",
          "Mangalsutras",
          "Bracelets",
          "Earrings",
          "Mens",
          "Necklaces",
        ]),
        viewAllHref: "/collection",
      },
      {
        key: "gender",
        label: "Gender",
        type: "panel",
        tiles: [
          { label: "Woman", href: "/demifine" },
          { label: "Men", href: "/demifine" },
        ],
      },
      {
        key: "collection",
        label: "Collection",
        type: "panel",
        tiles: tiles([
          "AM To PM Collection",
          "Emily In Paris",
          "Evil Eye Collection",
          "Forever Casual",
          "Ombre Collection",
          "On You Collection",
          "Signature Collection",
        ]),
        viewAllHref: "/demifine",
      },
      {
        key: "occasion",
        label: "Occassion",
        type: "panel",
        tiles: tiles([
          "Festive Collection",
          "Office Wear",
          "Party Wear",
          "Vacay Mode",
          "Valentine's Special",
          "Wedding Collection",
        ]),
      },
      {
        key: "style",
        label: "Style",
        type: "panel",
        tiles: tiles(["Minimal", "Statement", "Stackable", "Classic"]),
      },
      {
        key: "gifting",
        label: "Gifting",
        type: "panel",
        tiles: tiles([
          "Gifts for Her",
          "Gifts for Him",
          "Gift Card",
          "Corporate Gifting",
          "Mother's Special",
        ]),
      },
      { key: "fine-silver", label: "Fine Silver", type: "link", href: "/silver", badge: "Luxe" },
      { key: "new-arrival", label: "New Arrival", type: "link", href: "/collection/new-arrivals" },
      { key: "best-sellers", label: "Best Sellers", type: "link", href: "/collection/best-sellers" },
    ],
  },
  {
    key: "gold",
    label: "Gold Jewellery",
    entries: [
      {
        key: "category",
        label: "Category",
        type: "panel",
        tiles: tiles(["Rings", "Mangalsutras", "Bracelets", "Earrings", "Necklaces", "Coins"]),
        viewAllHref: "/gold",
      },
      {
        key: "gender",
        label: "Gender",
        type: "panel",
        tiles: [
          { label: "Woman", href: "/gold" },
          { label: "Men", href: "/gold" },
        ],
      },
      {
        key: "collection",
        label: "Collection",
        type: "panel",
        tiles: tiles([
          "9KT Gold",
          "14KT Gold",
          "Lab Grown Diamonds",
          "Daily Gold",
        ]),
        viewAllHref: "/gold",
      },
      {
        key: "occasion",
        label: "Occassion",
        type: "panel",
        tiles: tiles(["Wedding Collection", "Festive Collection", "Daily Wear"]),
      },
      {
        key: "gifting",
        label: "Gifting",
        type: "panel",
        tiles: tiles(["Gifts for Her", "Gifts for Him", "Gift Card"]),
      },
      { key: "new-arrival", label: "New Arrival", type: "link", href: "/collection/new-arrivals" },
      { key: "best-sellers", label: "Best Sellers", type: "link", href: "/collection/best-sellers" },
    ],
  },
];
