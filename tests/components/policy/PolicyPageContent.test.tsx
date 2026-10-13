import { render, screen } from '@testing-library/react';

import { PolicyPageContent } from '@/components/policy/PolicyPageContent';
import { getPolicyPageBySlug } from '@/config/policy/policy-pages.config';

describe('PolicyPageContent', () => {
  it('renders FAQ accordion with page title', () => {
    const page = getPolicyPageBySlug('faqs');
    if (!page || page.content.kind !== 'faq') {
      throw new Error('Expected FAQ policy page');
    }

    render(<PolicyPageContent content={page.content} />);

    expect(screen.getByRole('heading', { name: 'FAQs' })).toBeInTheDocument();
    expect(screen.getByText('What is Demifine® collection?')).toBeInTheDocument();
  });

  it('renders prose policy sections', () => {
    const page = getPolicyPageBySlug('payment-policy');
    if (!page || page.content.kind !== 'prose') {
      throw new Error('Expected prose policy page');
    }

    render(<PolicyPageContent content={page.content} />);

    expect(screen.getByRole('heading', { name: 'Payment Policy' })).toBeInTheDocument();
    expect(screen.getByText(/Prepaid Payments/i)).toBeInTheDocument();
  });

  it('renders rewards FAQ and body lines', () => {
    const page = getPolicyPageBySlug('palmonas-rewards-policy');
    if (!page || page.content.kind !== 'faq-prose') {
      throw new Error('Expected faq-prose policy page');
    }

    render(<PolicyPageContent content={page.content} />);

    expect(screen.getByRole('heading', { name: page.content.pageTitle })).toBeInTheDocument();
    expect(page.content.faqItems.length).toBeGreaterThan(0);
    expect(page.content.bodyLines.length).toBeGreaterThan(0);
  });

  it('shows not-found content gracefully for empty prose', () => {
    render(
      <PolicyPageContent
        content={{
          kind: 'prose',
          pageTitle: 'Test Policy',
          sections: [{ paragraphs: ['Line one.'] }],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Test Policy' })).toBeInTheDocument();
    expect(screen.getByText('Line one.')).toBeInTheDocument();
  });
});
