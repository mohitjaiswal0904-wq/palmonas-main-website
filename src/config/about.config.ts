export const ABOUT_HERO_IMAGE = '/images/about/hero-banner.webp';
export const ABOUT_STORES_INFOGRAPHIC_IMAGE = '/images/about/stores-infographic.png';
export const ABOUT_STORE_LIFESTYLE_IMAGE = '/images/about/store-lifestyle.png';
export const ABOUT_STORE_EXTERIOR_IMAGE = '/images/about/store-exterior.png';

export const ABOUT_TAGLINE = 'We Believe Demifine® Jewellery Is The Future';

export const ABOUT_INTRO =
  'DEMIFINE® FASHION PRIVATE LIMITED is the first Demifine® jewellery brand that was born out of a desire to offer affordable luxury to fashion-conscious women. Our aim is to make women feel confident, stylish, and empowered without breaking the bank. We strive to create a brand that empowers women to look and feel their best every day.';

export const ABOUT_SHRADDHA_HEADING = 'Palmonas X Shraddha Kapoor';

export const ABOUT_SHRADDHA_STORY =
  "The story of the union of Palmonas and Shraddha Kapoor is a tale of a mutual passion for jewellery and Shraddha's growing affinity for the brand and its motive. The Bollywood star's alliance with Palmonas as a co-founder is undoubtedly a pivotal point in the legacy of our brand. We're honoured to have Shraddha Kapoor join our journey and deeply grateful for the continued support of all our customers. Together, we'll continue to create products that empower and inspire individuals to embrace their unique stories.";

export const ABOUT_MISSION_HEADING = 'Our Mission';

export const ABOUT_MISSION_QUOTE = 'Luxury made affordable for modern youth';

export const ABOUT_MISSION_BODY =
  ' is a mission that is driven by the belief that everyone deserves to experience the pleasure and confidence that come from owning and wearing luxurious jewellery, regardless of their income or social status.';

export const ABOUT_STORE_HEADING = 'About The Brand Store';

export const ABOUT_STORE_PARAGRAPHS = [
  'We have been in business since 2022 as one of the first Demifine® jewellery brands.',
  "We design all of our original and eye-catching products in-house at our Pune-based headquarters, PALMONAS, and we now ship to over 200 countries. If you're in Pune, come say hello! Our store is located at Lane 5, Koregaon Park.",
  'We choose fashionable designs with high-quality craftsmanship that can be worn every day. Our Demifine® styles are the pinnacle of self-expression because they were made to be stacked.',
] as const;

export interface AboutImageSection {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const aboutImages: AboutImageSection[] = [
  {
    src: ABOUT_HERO_IMAGE,
    alt: 'Palmonas Demifine jewellery with Shraddha Kapoor signature and brand store',
    width: 1920,
    height: 762,
  },
  {
    src: ABOUT_STORES_INFOGRAPHIC_IMAGE,
    alt: 'Palmonas stores across India infographic',
    width: 900,
    height: 400,
  },
  {
    src: ABOUT_STORE_LIFESTYLE_IMAGE,
    alt: 'Palmonas brand store lifestyle',
    width: 900,
    height: 500,
  },
  {
    src: ABOUT_STORE_EXTERIOR_IMAGE,
    alt: 'Palmonas retail store exterior',
    width: 900,
    height: 500,
  },
];
