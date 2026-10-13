/**
 * Mock product generator used to populate the various product grids
 * (home, gold, silver, demifine) until a real product API is wired in.
 */

import type { Product } from "@/types/product";
import { shouldShowRandomNewArrivalTag } from "@/lib/productBadges";

const defaultTitles = [
  "Lunar Flow 9KT Gold Earrings",
  "Emerald Drop Hoop Earrings",
  "Celestial Stud 9KT Gold",
  "Verde Dangle Earrings",
  "Aurora Green Gemstone Hoops",
  "Solene Emerald Studs",
  "Petite Square Drop Earrings",
];

const goldTitles = [
  "Radiant Halo 14KT Gold Ring",
  "Eternal Knot Gold Pendant",
  "Sunlit Bloom Gold Studs",
  "Royal Crest Gold Bangle",
  "Aurelia Gold Hoop Earrings",
  "Heritage Gold Mangalsutra",
  "Twilight Gold Chain",
];

export const PRODUCT_IMAGE = "/collection/product-earrings.jpg";

export type ProductTheme = "default" | "gold" | "silver" | "demifine";

const collectionFor: Record<ProductTheme, Product["collection"]> = {
  default: undefined,
  gold: "Gold",
  silver: "Silver",
  demifine: "Demi-fine",
};

export function makeProducts(
  prefix: string,
  count = 6,
  theme: ProductTheme = "default",
): Product[] {
  const titles = theme === "gold" ? goldTitles : defaultTitles;
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    title: titles[i % titles.length],
    image: PRODUCT_IMAGE,
    price:
      theme === "gold"
        ? i % 2 === 0
          ? "₹18,499"
          : "₹12,999"
        : i % 2 === 0
          ? "₹2,499"
          : "₹1,999",
    mrp:
      theme === "gold"
        ? i % 2 === 0
          ? "₹21,299"
          : "₹15,799"
        : i % 2 === 0
          ? "₹3,299"
          : "₹2,799",
    discount: "Extra 25% OFF",
    extraOffers: 2,
    rating: 4.5,
    reviews: 125 - (i % 5) * 8,
    isNewArrival: shouldShowRandomNewArrivalTag(`${prefix}-${i + 1}`),
    collection: collectionFor[theme],
    metals:
      theme === "gold"
        ? ["Yellow Gold", "Rose Gold", "White Gold"]
        : theme === "silver"
          ? ["Silver", "White Gold"]
          : i % 2 === 0
            ? ["Rose Gold", "Yellow Gold", "White Gold"]
            : ["Yellow Gold", "Silver"],
  }));
}
