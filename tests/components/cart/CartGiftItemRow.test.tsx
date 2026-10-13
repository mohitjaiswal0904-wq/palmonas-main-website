/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

import { CartGiftItemRow } from '@/components/cart/CartGiftItemRow';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { formatPrice } from '@/lib/format-price';

const gift = {
  name: 'Sterling Silver Stud Earrings',
  imageUrl: '/images/cart/gift-card-gift.png',
  worthAmount: 1299,
};

describe('CartGiftItemRow', () => {
  it('renders the gift name, thumb, and Yours badge', () => {
    render(
      <CartGiftItemRow name={gift.name} imageUrl={gift.imageUrl} worthAmount={gift.worthAmount} />,
    );

    expect(screen.getByTestId('cart-gift-item-row')).toBeInTheDocument();
    expect(screen.getByText(gift.name)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: gift.name })).toHaveAttribute('src', gift.imageUrl);
    expect(screen.getByTestId('cart-gift-item-badge')).toHaveTextContent(cartMessages.giftItemYours);
  });

  it('formats the worth line and uses gift-row tokens', () => {
    render(
      <CartGiftItemRow name={gift.name} imageUrl={gift.imageUrl} worthAmount={gift.worthAmount} />,
    );

    expect(
      screen.getByText(
        cartMessages.giftItemWorth.replace('{amount}', formatPrice(gift.worthAmount)),
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('cart-gift-item-row')).toHaveStyle({
      backgroundColor: cartTheme.giftItemBg,
      borderColor: cartTheme.giftItemBorder,
    });
    expect(screen.getByTestId('cart-gift-item-badge')).toHaveStyle({
      backgroundColor: cartTheme.giftItemBadgeBg,
      color: cartTheme.giftItemBadgeText,
    });
  });

  it('treats an empty name as a decorative thumb', () => {
    const { container } = render(
      <CartGiftItemRow name="" imageUrl={gift.imageUrl} worthAmount={0} />,
    );

    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText(gift.name)).not.toBeInTheDocument();
  });

  it('still shows the Yours badge when worth is zero', () => {
    render(<CartGiftItemRow name={gift.name} imageUrl={gift.imageUrl} worthAmount={0} />);

    expect(
      screen.getByText(cartMessages.giftItemWorth.replace('{amount}', formatPrice(0))),
    ).toBeInTheDocument();
    expect(screen.getByTestId('cart-gift-item-badge')).toHaveTextContent(cartMessages.giftItemYours);
  });
});
