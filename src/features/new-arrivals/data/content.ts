import type { CategoryCircleItem } from "@/components/collection/CategoryCircles";
import { NEW_ARRIVALS_GRADIENT } from "@/features/new-arrivals/constants/theme";

export const HERO_IMAGE = "/new-arrivals/hero.png";

export const categories: CategoryCircleItem[] = [
  { label: "Rings", handle: "rings" },
  { label: "Earrings", handle: "earrings" },
  { label: "Necklaces", handle: "necklaces" },
  { label: "Bracelets", handle: "bracelets" },
  { label: "Mangalsutras", handle: "mangalsutra" },
  { label: "Pendants", handle: "pendant-necklaces" },
  { label: "Chains", handle: "chains" },
  { label: "Anklets", handle: "anklets" },
];

export const shopWhatsNewChips = [
  { label: "All New", handle: "new-arrivals" },
  { label: "Rings", handle: "rings" },
  { label: "Earrings", handle: "earrings" },
  { label: "Bestsellers", handle: "best-sellers" },
  { label: "Under ₹999", handle: "exclusive-999-collection" },
];

export const curatedEdits = [
  {
    label: "Breakfast in Paris",
    handle: "emily-in-paris",
    gradient: NEW_ARRIVALS_GRADIENT,
  },
  {
    label: "Emily in Paris",
    handle: "emily-in-paris",
    gradient: NEW_ARRIVALS_GRADIENT,
  },
  {
    label: "Everyday Essentials",
    handle: "everyday-essentials",
    gradient: "linear-gradient(149deg, #FBF7EE 0%, #F1E5C9 100%)",
  },
  {
    label: "Heart Collection",
    handle: "heart-collection",
    gradient: NEW_ARRIVALS_GRADIENT,
  },
];

export const themeCards = [
  { label: "Heart", handle: "heart-collection", rotate: 0 },
  { label: "Butterfly", handle: "celestial-collection", rotate: -4 },
  { label: "Stud", handle: "stud-earrings", rotate: 5 },
  { label: "Star", handle: "celestial-collection", rotate: 0 },
];

export const metalDrops = [
  {
    title: "New in Gold",
    subtitle: "9KT & 14KT fine gold",
    href: "/collection/9kt-fine-gold",
    gradient:
      "linear-gradient(149deg, #FBF7EE 0%, #F9F3E5 14%, #F8F1E1 29%, #F6EED8 43%, #F4E9D0 57%, #F1E5C9 71%, #EDE0B9 86%, #E8D5A8 100%)",
  },
  {
    title: "New in Silver",
    subtitle: "925 sterling silver",
    href: "/collection/sterling-silver",
    gradient:
      "linear-gradient(149deg, #F8FAFB 0%, #F2F4F7 25%, #ECEFF3 50%, #E4E9EF 75%, #D5DCE4 100%)",
  },
  {
    title: "New in Demifine",
    subtitle: "Anti-tarnish everyday luxury",
    href: "/collection/demi-fine-jewellery",
    gradient: NEW_ARRIVALS_GRADIENT,
  },
];
