/**
 * Static catalog data + search helpers powering the search box and results page.
 * `CatalogProduct` is the lightweight search record (distinct from the richer
 * product-card `Product` type in `@/types/product`).
 */

export type Collection = "Gold" | "Silver" | "Demi-fine";

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  collection: Collection;
  price: string;
  href: string;
};

export type CollectionEntry = {
  name: Collection;
  href: string;
  description: string;
  keywords: string[];
};

export const collections: CollectionEntry[] = [
  {
    name: "Gold",
    href: "/gold",
    description: "18k gold-plated, anti-tarnish everyday pieces",
    keywords: ["gold", "9kt", "fine gold", "golden", "yellow"],
  },
  {
    name: "Silver",
    href: "/silver",
    description: "925 sterling silver with a clean, modern shine",
    keywords: ["silver", "sterling", "925", "fine silver"],
  },
  {
    name: "Demi-fine",
    href: "/demifine",
    description: "Rose-gold tones and gemstones for every day",
    keywords: ["demifine", "demi-fine", "demi fine", "rose gold", "demi"],
  },
];

export const products: CatalogProduct[] = [
  { id: "g1", name: "Halo Hoops", category: "Earrings", collection: "Gold", price: "₹1,499", href: "/gold" },
  { id: "g2", name: "Serpent Ring", category: "Rings", collection: "Gold", price: "₹1,199", href: "/gold" },
  { id: "g3", name: "Drift Chain", category: "Chains", collection: "Gold", price: "₹2,299", href: "/gold" },
  { id: "g4", name: "Sunbeam Pendant", category: "Pendants", collection: "Gold", price: "₹1,799", href: "/gold" },
  { id: "g5", name: "Ember Stud Earrings", category: "Earrings", collection: "Gold", price: "₹999", href: "/gold" },
  { id: "g6", name: "Aurora Bangle", category: "Bracelets", collection: "Gold", price: "₹2,499", href: "/gold" },

  { id: "s1", name: "Frost Solitaire Ring", category: "Rings", collection: "Silver", price: "₹1,899", href: "/silver" },
  { id: "s2", name: "Mist Chain", category: "Chains", collection: "Silver", price: "₹1,599", href: "/silver" },
  { id: "s3", name: "Glacier Hoops", category: "Earrings", collection: "Silver", price: "₹1,299", href: "/silver" },
  { id: "s4", name: "Lunar Pendant", category: "Pendants", collection: "Silver", price: "₹1,499", href: "/silver" },
  { id: "s5", name: "Tide Cuff Bracelet", category: "Bracelets", collection: "Silver", price: "₹2,099", href: "/silver" },
  { id: "s6", name: "Pearl Drop Mangalsutra", category: "Mangalsutra", collection: "Silver", price: "₹2,799", href: "/silver" },

  { id: "d1", name: "Blush Solitaire", category: "Rings", collection: "Demi-fine", price: "₹2,499", href: "/demifine" },
  { id: "d2", name: "Petal Hoops", category: "Earrings", collection: "Demi-fine", price: "₹1,699", href: "/demifine" },
  { id: "d3", name: "Aura Tennis Bracelet", category: "Bracelets", collection: "Demi-fine", price: "₹3,299", href: "/demifine" },
  { id: "d4", name: "Rose Charm Necklace", category: "Necklaces", collection: "Demi-fine", price: "₹2,899", href: "/demifine" },
  { id: "d5", name: "Glow Pendant", category: "Pendants", collection: "Demi-fine", price: "₹1,999", href: "/demifine" },
  { id: "d6", name: "Heritage Mangalsutra", category: "Mangalsutra", collection: "Demi-fine", price: "₹3,499", href: "/demifine" },
];

export const popularSearches = [
  "Rings",
  "Gold Earrings",
  "Mangalsutra",
  "Bracelets",
  "Pendants",
  "Silver Chains",
];

export function searchCollections(query: string): CollectionEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return collections.filter((c) => {
    const haystack =
      `${c.name} ${c.description} ${c.keywords.join(" ")}`.toLowerCase();
    return terms.some((t) => haystack.includes(t));
  });
}

export function searchProducts(query: string): CatalogProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return products.filter((p) => {
    const haystack = `${p.name} ${p.category} ${p.collection}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
