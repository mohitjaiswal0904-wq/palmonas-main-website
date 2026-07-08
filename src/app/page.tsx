import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import HomePage from "@/features/home/HomePage";
import HomeSeoJsonLd from "@/features/home/HomeSeoJsonLd";

export const metadata: Metadata = {
  title:
    "Buy Everyday Demifine® Jewellery, Curated by Shraddha Kapoor | Palmonas",
  description:
    "Palmonas Jewellery — everyday luxury that doesn't sit in a box. Shop waterproof, skin-safe Demifine® jewellery made with 925 sterling silver, 18k gold plating, and lab grown diamonds.",
  keywords: [
    "Palmonas jewellery",
    "Demifine jewellery",
    "Shraddha Kapoor jewellery",
    "gold plated jewellery",
    "sterling silver jewellery",
    "lab grown diamond jewellery",
    "daily wear jewellery",
    "hypoallergenic jewellery",
    "waterproof jewellery",
    "necklaces for women",
    "gold earrings for women",
    "gold rings for women",
    "mangalsutra",
    "jewellery online India",
  ],
  openGraph: {
    title:
      "Buy Everyday Demifine® Jewellery, Curated by Shraddha Kapoor | Palmonas",
    description:
      "Everyday luxury jewellery that doesn't sit in a box. Waterproof, skin-safe Demifine® pieces made to be worn every day.",
    type: "website",
  },
};

export default function Page() {
  return (
    <>
      <HomeSeoJsonLd />
      <HomePage />
      <Footer />
    </>
  );
}
