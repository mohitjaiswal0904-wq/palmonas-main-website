import faqsConfig from '@/config/faqs/faqs.config.json';

export interface PopFaqItem {
  question: string;
  answer: string;
}

export interface PopFaqSection {
  id: string;
  title: string;
  items: PopFaqItem[];
}

export const faqsMessages = faqsConfig.messages;
export const popFaqSections: PopFaqSection[] = faqsConfig.sections;
export const popFaqTerms: string[] = faqsConfig.terms;

export const POP_FAQ_HREF = '/pages/pop-faqs';
