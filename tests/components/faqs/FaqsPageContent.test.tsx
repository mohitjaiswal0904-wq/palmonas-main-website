import { render, screen } from '@testing-library/react';

import { FaqsPageContent } from '@/components/faqs/FaqsPageContent';

describe('FaqsPageContent', () => {
  it('renders POP Plan title and first expanded FAQ answer', () => {
    render(<FaqsPageContent />);

    expect(screen.getByRole('heading', { level: 1, name: 'POP Plan' })).toBeInTheDocument();
    expect(
      screen.getByText('Plan of Purchase - Frequently Asked Questions'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'You can start your Plan of Purchase with a minimum amount of ₹1,000 per month. Amount must be selected in multiples of ₹1,000.',
      ),
    ).toBeInTheDocument();
  });

  it('renders FAQ section headings and T&C block', () => {
    render(<FaqsPageContent />);

    expect(screen.getByRole('heading', { level: 2, name: 'Generic' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Enrolment' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Redemption' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Policy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'T&C' })).toBeInTheDocument();
    expect(screen.getByText('1. The scheme tenure is 5 months, with a minimum enrolment amount per month of ₹1,000.')).toBeInTheDocument();
  });

  it('links back to POP with accessible label', () => {
    render(<FaqsPageContent />);

    expect(screen.getByRole('link', { name: 'Back to POP savings plan' })).toHaveAttribute(
      'href',
      '/pop',
    );
  });

  it('lists a redemption FAQ question', () => {
    render(<FaqsPageContent />);

    expect(screen.getByText('When can I redeem my P-POP amount?')).toBeInTheDocument();
  });
});
