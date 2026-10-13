import { render, screen } from '@testing-library/react';

import { OfferBadges } from '@/components/product/OfferBadges';
import { productMessages } from '@/config/product/product.config';
import type { ProductOffer } from '@/types/product';
import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

const mockOffer: ProductOffer = {
  key: 'offer-1',
  name: 'Buy 1 Get 1 Free',
  description: 'Note: You need to add minimum 2 products to avail this discount.',
  code: 'B1G1',
  type: 'FREEBIE',
  discountValue: 3266,
  placeholder: [{ text: 'Perfect Time to Stock Up', style: 'normal' }],
};

describe('OfferBadges', () => {
  it('returns null when there are no offers', () => {
    const { container } = render(<OfferBadges offers={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders deals label and scrollable offer region', () => {
    render(<OfferBadges offers={[mockOffer]} />);

    expect(screen.getByLabelText(productMessages.deals)).toBeInTheDocument();
    expect(screen.getByText(productMessages.deals)).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: productMessages.a11y.scrollableOffers }),
    ).toBeInTheDocument();
  });

  it('renders a section heading aligned with the offer cards', () => {
    render(<OfferBadges offers={[mockOffer]} />);

    const heading = screen.getByRole('heading', { name: productMessages.deals });

    expect(heading).toHaveClass('text-sm', 'font-semibold');
    expect(heading.parentElement).toHaveClass('flex', 'flex-col', 'gap-3');
    expect(screen.queryByText(productMessages.deals)?.closest('.rounded-l-full')).toBeNull();
  });

  it('renders offer cards inside the scroll list', () => {
    render(<OfferBadges offers={[mockOffer]} />);

    expect(screen.getByText('Buy 1 Get 1 Free')).toBeInTheDocument();
    expect(screen.getByText(/Note: You need to add minimum 2 products/)).toBeInTheDocument();
    expect(screen.getByText('B1G1')).toBeInTheDocument();
  });
});
