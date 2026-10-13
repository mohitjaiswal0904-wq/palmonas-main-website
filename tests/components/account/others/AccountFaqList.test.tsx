import { render, screen } from '@testing-library/react';

import { AccountRichFaqList } from '@/components/account/others/AccountRichFaqList';
import { AccountProseBlocks } from '@/components/account/others/AccountProseBlocks';

describe('AccountRichFaqList', () => {
  it('renders question and paragraph answers', () => {
    render(
      <AccountRichFaqList
        heading="Frequently Asked Questions"
        items={[
          {
            question: 'How do I place an order?',
            paragraphs: ['Add them to your cart.', 'Complete the payment.'],
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Frequently Asked Questions' }),
    ).toBeInTheDocument();
    expect(screen.getByText('How do I place an order?')).toBeInTheDocument();
    expect(screen.getByText('Add them to your cart.')).toBeInTheDocument();
  });

  it('shows section labels between groups', () => {
    render(
      <AccountRichFaqList
        items={[
          { section: 'Returns', question: 'Q1?', paragraphs: ['A1'] },
          { section: 'Returns', question: 'Q2?', paragraphs: ['A2'] },
          { section: 'Wallet Credits', question: 'Q3?', paragraphs: ['A3'] },
        ]}
      />,
    );

    expect(screen.getByText('Returns')).toBeInTheDocument();
    expect(screen.getByText('Wallet Credits')).toBeInTheDocument();
  });
});

describe('AccountProseBlocks', () => {
  it('renders body lines as paragraphs', () => {
    render(<AccountProseBlocks lines={['Participation in this Offer is purely voluntary.']} />);

    expect(
      screen.getByText('Participation in this Offer is purely voluntary.'),
    ).toBeInTheDocument();
  });

  it('promotes labelled lines to headings', () => {
    render(<AccountProseBlocks lines={['ELIGIBILITY:', 'Must be 18+.']} />);

    expect(screen.getByRole('heading', { name: 'ELIGIBILITY:' })).toBeInTheDocument();
    expect(screen.getByText('Must be 18+.')).toBeInTheDocument();
  });
});
