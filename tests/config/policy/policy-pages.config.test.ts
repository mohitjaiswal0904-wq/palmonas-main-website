import { getPolicyPageBySlug, getPolicyPageSlugs } from '@/config/policy/policy-pages.config';

describe('policy-pages.config', () => {
  it('resolves jewellery FAQs at faqs and faq slugs', () => {
    const faqs = getPolicyPageBySlug('faqs');
    const faq = getPolicyPageBySlug('faq');

    expect(faqs?.content.kind).toBe('faq');
    expect(faq?.content).toBe(faqs?.content);
    if (faqs?.content.kind === 'faq') {
      expect(faqs.content.items[0]?.question).toBe('What is Demifine® collection?');
    }
  });

  it('resolves footer policy slugs', () => {
    expect(getPolicyPageBySlug('privacy-policy')?.content.kind).toBe('prose');
    expect(getPolicyPageBySlug('terms-of-service')?.content.kind).toBe('prose');
    expect(getPolicyPageBySlug('palmonas-rewards-policy')?.content.kind).toBe('faq-prose');
    expect(getPolicyPageBySlug('shipping-delivery-policy')?.content.pageTitle).toBe(
      'Shipping & Delivery Policy',
    );
    expect(getPolicyPageBySlug('warranty-page')?.content.pageTitle).toBe('Lifetime Warranty Policy');
    expect(getPolicyPageBySlug('lifetime-warranty-policy')?.content).toBe(
      getPolicyPageBySlug('warranty-page')?.content,
    );
    expect(getPolicyPageBySlug('lifetime-buy-back-policy')?.content.pageTitle).toBe(
      'Lifetime Buy-Back Policy',
    );
    expect(getPolicyPageBySlug('lifetime-buyback-policy')?.content).toBe(
      getPolicyPageBySlug('lifetime-buy-back-policy')?.content,
    );
    const warranty = getPolicyPageBySlug('warranty-page')?.content;
    if (warranty?.kind === 'prose') {
      expect(warranty.sections?.[0]?.heading).toBe('For Demifine® Collection :');
    }
  });

  it('returns null for unknown slugs', () => {
    expect(getPolicyPageBySlug('unknown-policy-page')).toBeNull();
  });

  it('lists all registered slugs', () => {
    expect(getPolicyPageSlugs()).toContain('faqs');
    expect(getPolicyPageSlugs()).toContain('shipping-delivery-policy');
  });
});
