import { render, screen } from '@testing-library/react';

import { OfferListCard } from '@/components/cart/offers/OfferListCard';
import { cartMessages } from '@/config/cart/cart.config';

describe('OfferListCard', () => {
  it('renders ticket badge, code, and apply pill', () => {
    render(
      <OfferListCard
        badge="DISCOUNT"
        subtitle="On orders above ₹999"
        code="SAVE20"
        description="Get 20% off your order"
        onApply={jest.fn()}
      />,
    );

    expect(screen.getByText('DISCOUNT')).toBeInTheDocument();
    expect(screen.getByTestId('coupon-ticket-stub')).toHaveClass('w-[69px]');
    expect(screen.getByText('SAVE20')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `${cartMessages.applyCode} SAVE20` })).toHaveClass(
      'rounded-full',
    );
  });

  it('uppercases offer titles from the API', () => {
    render(
      <OfferListCard
        badge="discount"
        subtitle="Buy one get one free"
        code="b1g1"
        description="Need 2 products"
        onApply={jest.fn()}
      />,
    );

    expect(screen.getByText('DISCOUNT')).toBeInTheDocument();
    expect(screen.getByText('BUY ONE GET ONE FREE')).toBeInTheDocument();
    expect(screen.getByText('B1G1')).toBeInTheDocument();
  });

  it('hides apply button in view-only mode', () => {
    render(
      <OfferListCard
        badge="DISCOUNT"
        subtitle="Cashback"
        code="NAVIUPI"
        description="UPI cashback"
        viewOnly
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('disables apply when disabled', () => {
    render(
      <OfferListCard
        badge="DISCOUNT"
        subtitle="Locked"
        code="EOSS"
        description="Need more items"
        onApply={jest.fn()}
        disabled
      />,
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders Add Items link for unlock offers with collection href', () => {
    render(
      <OfferListCard
        badge="DISCOUNT"
        subtitle={cartMessages.discounts.unlockOne}
        code="mangalsutra25"
        description="25% off MANGALSUTRA"
        viewOnly
        unlockHref="/collections/mangalsutra"
      />,
    );

    const addItems = screen.getByRole('link', {
      name: cartMessages.a11y.addItemsForOffer.replace('{code}', 'MANGALSUTRA25'),
    });
    expect(addItems).toHaveAttribute('href', '/collections/mangalsutra');
    expect(addItems).toHaveTextContent(cartMessages.addItems);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
