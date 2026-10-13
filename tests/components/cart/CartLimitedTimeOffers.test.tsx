import { fireEvent, render, screen } from '@testing-library/react';

import { CartLimitedTimeOffers } from '@/components/cart/CartLimitedTimeOffers';
import { cartMessages } from '@/config/cart/cart.config';

jest.mock('@/config/cart/cart.config', () => {
  const actual = jest.requireActual('@/config/cart/cart.config');
  return {
    ...actual,
    isCartFeatureEnabled: jest.fn((feature: string) => feature === 'limitedTimeOffers'),
    cartConfig: {
      ...actual.cartConfig,
      mock: {
        ...actual.cartConfig.mock,
        limitedTimeOffers: {
          title: 'Flash Sale',
          products: [
            {
              id: 'no-image',
              name: 'Stud Earrings',
              price: 499,
              swatches: ['#111111', '#cccccc'],
              rating: 4.2,
              reviewCount: 12,
            },
            {
              id: 'minimal',
              name: 'Minimal Ring',
              price: 999,
            },
          ],
        },
      },
    },
  };
});

const { isCartFeatureEnabled } = jest.requireMock('@/config/cart/cart.config') as {
  isCartFeatureEnabled: jest.Mock;
};

describe('CartLimitedTimeOffers branches', () => {
  beforeEach(() => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'limitedTimeOffers');
  });

  it('renders products without images and without optional badge or countdown', () => {
    render(<CartLimitedTimeOffers />);

    expect(screen.getByText('Flash Sale')).toBeInTheDocument();
    expect(screen.getAllByTestId('lto-product-card')).toHaveLength(2);
    expect(screen.getAllByTestId('lto-product-card')[0]).toHaveClass('border-black/10');
    expect(screen.queryByTestId('lto-badge')).not.toBeInTheDocument();
    const addButton = screen.getAllByTestId('lto-add-button')[0]!;
    expect(addButton).toBeInTheDocument();
    expect(addButton.querySelector('svg')).toBeTruthy();
    expect(screen.getByLabelText('Product rating: 4.2 out of 5 from 12 reviews')).toBeInTheDocument();
    expect(screen.getAllByLabelText(cartMessages.a11y.addToCart)[0]).toBeInTheDocument();
  });

  it('returns null when limited-time offers feature is disabled', () => {
    isCartFeatureEnabled.mockReturnValue(false);
    const { container } = render(<CartLimitedTimeOffers />);
    expect(container).toBeEmptyDOMElement();
  });
});
