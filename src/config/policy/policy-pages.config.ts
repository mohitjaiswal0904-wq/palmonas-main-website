import faqsContent from '@/config/account/content/faqs.content.json';
import privacyContent from '@/config/account/content/privacy.content.json';
import rewardsPolicyContent from '@/config/account/content/rewards-policy.content.json';
import grievanceContent from '@/config/policy/content/grievance-redressal-policy.content.json';
import buyBackContent from '@/config/policy/content/lifetime-buy-back-policy.content.json';
import paymentContent from '@/config/policy/content/payment-policy.content.json';
import returnExchangeContent from '@/config/policy/content/return-exchange-policy.content.json';
import shippingContent from '@/config/policy/content/shipping-delivery-policy.content.json';
import termsContent from '@/config/policy/content/terms-of-service.content.json';
import warrantyContent from '@/config/policy/content/warranty-page.content.json';
import type {
  PolicyFaqPageContent,
  PolicyFaqProsePageContent,
  PolicyPageDefinition,
  PolicyProsePageContent,
} from '@/types/policy/policy.types';

const faqsPage: PolicyFaqPageContent = {
  kind: 'faq',
  pageTitle: faqsContent.pageTitle,
  items: faqsContent.items,
};

const privacyPage: PolicyProsePageContent = {
  kind: 'prose',
  pageTitle: privacyContent.pageTitle,
  intro: privacyContent.intro,
  sections: privacyContent.sections,
};

const termsPage: PolicyProsePageContent = {
  kind: 'prose',
  pageTitle: termsContent.pageTitle,
  intro: termsContent.intro,
  sections: termsContent.sections,
};

const rewardsPage: PolicyFaqProsePageContent = {
  kind: 'faq-prose',
  pageTitle: rewardsPolicyContent.pageTitle,
  faqItems: rewardsPolicyContent.faqItems,
  bodyLines: rewardsPolicyContent.bodyLines,
};

const paymentPage: PolicyProsePageContent = {
  kind: 'prose',
  pageTitle: paymentContent.pageTitle,
  sections: paymentContent.sections,
};

const returnExchangePage: PolicyProsePageContent = {
  kind: 'prose',
  pageTitle: returnExchangeContent.pageTitle,
  sections: returnExchangeContent.sections,
};

const grievancePage: PolicyProsePageContent = {
  kind: 'prose',
  pageTitle: grievanceContent.pageTitle,
  intro: grievanceContent.intro,
  sections: grievanceContent.sections,
};

const shippingPage: PolicyProsePageContent = {
  kind: 'prose',
  pageTitle: shippingContent.pageTitle,
  sections: shippingContent.sections,
};

const buyBackPage: PolicyProsePageContent = {
  kind: 'prose',
  pageTitle: buyBackContent.pageTitle,
  sections: buyBackContent.sections,
};

const warrantyPage: PolicyProsePageContent = {
  kind: 'prose',
  pageTitle: warrantyContent.pageTitle,
  intro: warrantyContent.intro,
  sections: warrantyContent.sections,
};

/** Static verbatim policy pages keyed by `/pages/{slug}`. */
export const POLICY_PAGES: Record<string, PolicyPageDefinition> = {
  'faqs': {
    slug: 'faqs',
    metaDescription: 'Frequently asked questions about Palmonas Demifine® jewellery.',
    content: faqsPage,
  },
  'faq': {
    slug: 'faq',
    metaDescription: 'Frequently asked questions about Palmonas Demifine® jewellery.',
    content: faqsPage,
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    metaDescription: 'Palmonas privacy policy — how we collect and use your information.',
    content: privacyPage,
  },
  'terms-of-service': {
    slug: 'terms-of-service',
    metaDescription: 'Palmonas terms of service for website and store purchases.',
    content: termsPage,
  },
  'palmonas-rewards-policy': {
    slug: 'palmonas-rewards-policy',
    metaDescription: 'Palmonas Rewards wallet policy and redemption terms.',
    content: rewardsPage,
  },
  'payment-policy': {
    slug: 'payment-policy',
    metaDescription: 'Accepted payment methods and COD eligibility on Palmonas.',
    content: paymentPage,
  },
  'return-exchange-policy': {
    slug: 'return-exchange-policy',
    metaDescription: 'Palmonas return, exchange, and refund policy.',
    content: returnExchangePage,
  },
  'return-exchange': {
    slug: 'return-exchange',
    metaDescription: 'Palmonas return, exchange, and refund policy.',
    content: returnExchangePage,
  },
  'grievance-redressal-policy': {
    slug: 'grievance-redressal-policy',
    metaDescription: 'Palmonas grievance redressal policy and escalation contacts.',
    content: grievancePage,
  },
  'shipping-delivery-policy': {
    slug: 'shipping-delivery-policy',
    metaDescription:
      'Palmonas shipping and delivery timelines for domestic and international orders.',
    content: shippingPage,
  },
  'lifetime-buy-back-policy': {
    slug: 'lifetime-buy-back-policy',
    metaDescription:
      'Palmonas lifetime buy-back policy for Demifine®, gold, and lab-grown diamond jewellery.',
    content: buyBackPage,
  },
  'lifetime-buyback-policy': {
    slug: 'lifetime-buyback-policy',
    metaDescription:
      'Palmonas lifetime buy-back policy for Demifine®, gold, and lab-grown diamond jewellery.',
    content: buyBackPage,
  },
  'warranty-page': {
    slug: 'warranty-page',
    metaDescription:
      'Palmonas lifetime warranty on Demifine®, gold, lab-grown diamond, and tungsten jewellery.',
    content: warrantyPage,
  },
  'lifetime-warranty-policy': {
    slug: 'lifetime-warranty-policy',
    metaDescription:
      'Palmonas lifetime warranty on Demifine®, gold, lab-grown diamond, and tungsten jewellery.',
    content: warrantyPage,
  },
};

/**
 * Returns a static policy page definition when the slug is registered.
 *
 * @param slug - Path segment after `/pages/`.
 */
export function getPolicyPageBySlug(slug: string): PolicyPageDefinition | null {
  return POLICY_PAGES[slug] ?? null;
}

/**
 * All static policy slugs for static generation.
 */
export function getPolicyPageSlugs(): string[] {
  return Object.keys(POLICY_PAGES);
}
