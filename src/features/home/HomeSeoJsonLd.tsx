import { homeSeoFaqs } from "@/data/homeSeoContent";

export default function HomeSeoJsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeSeoFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Palmonas",
    description:
      "Everyday Demifine® jewellery curated by Shraddha Kapoor. Waterproof, skin-safe pieces made with 925 sterling silver and 18k gold plating.",
    url: "https://palmonas.com",
    brand: {
      "@type": "Brand",
      name: "Palmonas",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  );
}
