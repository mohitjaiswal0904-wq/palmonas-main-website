import { fireEvent, render, screen } from '@testing-library/react';

import { CartGiftCardSection } from '@/components/cart/CartGiftCardSection';
import { CartGiftWrapOption } from '@/components/cart/CartGiftWrapOption';
import { cartMessages } from '@/config/cart/cart.config';

jest.mock('@/config/cart/cart.config', () => ({
  ...jest.requireActual('@/config/cart/cart.config'),
  isCartFeatureEnabled: jest.fn((feature: string) => {
    const actual = jest.requireActual('@/config/cart/cart.config');
    return actual.isCartFeatureEnabled(feature);
  }),
}));

const { isCartFeatureEnabled } = jest.requireMock('@/config/cart/cart.config') as {
  isCartFeatureEnabled: jest.Mock;
};

describe('CartGiftCardSection', () => {
  beforeEach(() => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'giftCard');
  });

  it('renders gift card input and dismisses applied banner', () => {
    render(<CartGiftCardSection />);

    expect(screen.getByTestId('cart-gift-card-section')).toBeInTheDocument();
    expect(screen.getByTestId('cart-gift-card-applied')).toHaveClass('h-9', 'w-full');
    expect(screen.getByText(cartMessages.giftCardApplied)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(cartMessages.a11y.dismissGiftCard));
    expect(screen.queryByText(cartMessages.giftCardApplied)).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-see-all-gift-cards')).toHaveAttribute('href', '/cart/gift-cards');
  });

  it('returns null when gift card feature is disabled', () => {
    isCartFeatureEnabled.mockReturnValue(false);
    const { container } = render(<CartGiftCardSection />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('CartGiftWrapOption', () => {
  beforeEach(() => {
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'giftWrap');
  });

  it('toggles gift wrap checkbox', () => {
    const onChange = jest.fn();
    render(<CartGiftWrapOption checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('uses mobile 12px type and balanced desktop type/checkbox', () => {
    render(<CartGiftWrapOption checked={false} onChange={jest.fn()} />);

    const label = screen.getByTestId('cart-gift-wrap');
    expect(label).toHaveClass('text-xs', 'laptop:text-base', 'font-nunito-sans');
    expect(screen.getByRole('checkbox')).toHaveClass('size-[14px]', 'laptop:size-[18px]');
  });

  it('returns null when gift wrap feature is disabled', () => {
    isCartFeatureEnabled.mockReturnValue(false);
    const { container } = render(<CartGiftWrapOption checked={false} onChange={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
