import type { Metadata } from "next";
import NewArrivalsPage from "@/features/new-arrivals/NewArrivalsPage";

export const metadata: Metadata = {
  title: "New Arrivals | Palmonas Jewellery",
  description:
    "Discover the latest drops at Palmonas — fresh Demifine®, gold, and silver jewellery curated for everyday luxury. Shop new rings, earrings, necklaces, and more.",
  openGraph: {
    title: "New Arrivals | Palmonas Jewellery",
    description:
      "Shop the newest jewellery at Palmonas. Fresh styles in Demifine®, gold, and silver — made for every day.",
    type: "website",
  },
};

export default function Page() {
  return <NewArrivalsPage />;
}
