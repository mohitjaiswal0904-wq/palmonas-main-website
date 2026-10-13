/** FAQ item shape shared by policy and account FAQ pages. */
export interface PolicyFaqItem {
  question: string;
  paragraphs: readonly string[];
  section?: string | null;
}

/** Prose section with optional heading and paragraph lines. */
export interface PolicyProseSection {
  heading?: string;
  paragraphs: readonly string[];
}

/** Verbatim FAQ policy page (e.g. `/pages/faqs`). */
export interface PolicyFaqPageContent {
  kind: 'faq';
  pageTitle: string;
  items: readonly PolicyFaqItem[];
}

/** Verbatim prose policy page (privacy, terms, return policy, …). */
export interface PolicyProsePageContent {
  kind: 'prose';
  pageTitle: string;
  intro?: readonly string[];
  sections?: readonly PolicyProseSection[];
  bodyLines?: readonly string[];
}

export type PolicyPageContent =
  | PolicyFaqPageContent
  | PolicyProsePageContent
  | PolicyFaqProsePageContent;

/** FAQ list followed by prose blocks (rewards policy layout). */
export interface PolicyFaqProsePageContent {
  kind: 'faq-prose';
  pageTitle: string;
  faqItems: readonly PolicyFaqItem[];
  bodyLines: readonly string[];
}

export interface PolicyPageDefinition {
  slug: string;
  metaDescription?: string;
  content: PolicyPageContent;
}
