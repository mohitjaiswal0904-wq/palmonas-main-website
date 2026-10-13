'use client';

import { fireEvent, render, screen } from '@testing-library/react';

import { CartFormRow, CartOfferRow } from '@/components/cart/cart-input-rows';
import { CartOffersChevronIcon, CartOffersPercentIcon } from '@/components/cart/CartOffersIcons';
import { CouponTicketStub } from '@/components/cart/CouponTicketStub';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';

describe('CartFormRow', () => {
  it('uses Figma input styling tokens for default appearance', () => {
    render(
      <CartFormRow value="" onChange={jest.fn()} placeholder="Enter code" onApply={jest.fn()} />,
    );

    const input = screen.getByPlaceholderText('Enter code');
    expect(input).toHaveClass('h-9', 'rounded-lg', 'placeholder:text-[#64748b]');
    expect(input).toHaveStyle({ backgroundColor: cartTheme.formInputBg });

    const apply = screen.getByRole('button', { name: cartMessages.apply });
    expect(apply).toHaveClass('h-9', 'w-auto', 'rounded-lg', 'px-[17px]');
  });

  it('renders coupon appearance with attached green Apply', () => {
    render(
      <CartFormRow
        appearance="coupon"
        value=""
        onChange={jest.fn()}
        placeholder={cartMessages.couponPlaceholder}
        onApply={jest.fn()}
      />,
    );

    expect(screen.getByTestId('cart-coupon-form-row')).toHaveStyle({
      borderColor: cartTheme.couponInputBorder,
    });
    expect(screen.getByPlaceholderText(cartMessages.couponPlaceholder)).toHaveClass(
      'text-[11px]',
      'placeholder:text-[11px]',
    );
    expect(screen.getByRole('button', { name: cartMessages.apply })).toHaveStyle({
      backgroundColor: cartTheme.couponAppliedSolid,
    });
  });

  it('highlights the full coupon row border when the input is focused', () => {
    render(
      <CartFormRow
        appearance="coupon"
        value=""
        onChange={jest.fn()}
        placeholder={cartMessages.couponPlaceholder}
        onApply={jest.fn()}
      />,
    );

    const row = screen.getByTestId('cart-coupon-form-row');
    const input = screen.getByPlaceholderText(cartMessages.couponPlaceholder);

    fireEvent.focus(input);
    expect(row).toHaveAttribute('data-focused', 'true');
    expect(row).toHaveStyle({ borderColor: cartTheme.couponAppliedSolid });

    fireEvent.blur(input);
    expect(row).not.toHaveAttribute('data-focused');
    expect(row).toHaveStyle({ borderColor: cartTheme.couponInputBorder });
  });
});

describe('CartOfferRow', () => {
  it('renders applied ticket with the same stub and Applied pill', () => {
    render(<CartOfferRow code="SAVE10" detail="You save ₹500" applied />);

    const row = screen.getByTestId('cart-offer-row-applied');
    expect(row).toHaveClass('h-11', 'rounded-xl');
    expect(screen.getByTestId('coupon-ticket-stub')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.appliedStub)).toBeInTheDocument();
    expect(screen.getByText('SAVE10')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.applied)).toBeInTheDocument();
    expect(screen.getByText('You save ₹500')).toHaveStyle({
      color: cartTheme.couponTicketDetail,
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    render(
      <CartOfferRow code="SAVE10" detail="You save ₹500" applied onRemove={jest.fn()} />,
    );
    expect(screen.getByRole('button', { name: cartMessages.a11y.removeCoupon })).toBeInTheDocument();
  });

  it('renders available ticket with dashed border and Apply pill', () => {
    render(<CartOfferRow code="save10" detail="Buy more, save more" onApply={jest.fn()} />);

    const row = screen.getByTestId('cart-offer-row');
    expect(row).toHaveClass('border-dashed', 'rounded-xl');
    expect(row).toHaveStyle({ borderColor: cartTheme.couponTicketBorderAvailable });
    expect(screen.getByText('SAVE10')).toBeInTheDocument();
    expect(screen.getByText('Buy more, save more')).toBeInTheDocument();
    const apply = screen.getByRole('button', { name: cartMessages.apply });
    expect(apply).toHaveStyle({ backgroundColor: cartTheme.couponAppliedSolid });
    expect(apply).toHaveClass('rounded-full', 'text-[10px]');
  });

  it('renders unlock ticket with soft Add Items link', () => {
    render(
      <CartOfferRow
        code="25% off MANGALSUTRA"
        detail={cartMessages.discounts.unlockOne}
        unlockHref="/collections/mangalsutra"
      />,
    );

    expect(screen.getByTestId('cart-offer-row-unlock')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.discounts.unlockOne)).toBeInTheDocument();
    const addItems = screen.getByRole('link', { name: /Add items to unlock offer/i });
    expect(addItems).toHaveAttribute('href', '/collections/mangalsutra');
    expect(addItems).toHaveTextContent(cartMessages.addItems);
    expect(addItems).toHaveStyle({
      backgroundColor: cartTheme.couponAddItemsBg,
      color: cartTheme.couponAddItemsText,
    });
  });
});

describe('CouponTicketStub', () => {
  it('renders scalloped stub for offers list', () => {
    render(<CouponTicketStub label="DISCOUNT" />);
    expect(screen.getByTestId('coupon-ticket-stub')).toHaveAttribute('data-variant', 'scalloped');
    expect(screen.getByText('DISCOUNT')).toBeInTheDocument();
  });

  it('renders notch stub for cart preview', () => {
    render(<CouponTicketStub variant="notch" applied label="OFFER" />);
    const stub = screen.getByTestId('coupon-ticket-stub');
    expect(stub).toHaveAttribute('data-variant', 'notch');
    expect(stub).not.toHaveClass('overflow-hidden');
    expect(screen.getByText('OFFER')).toBeInTheDocument();
  });
});

describe('CartOffersIcons', () => {
  it('renders percent icon with 16 viewBox', () => {
    const { container } = render(<CartOffersPercentIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    expect(svg).toHaveAttribute('width', '14');
    expect(svg).toHaveAttribute('height', '14');
  });

  it('renders chevron icon with 14 viewBox', () => {
    const { container } = render(<CartOffersChevronIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 14 14');
    expect(svg).toHaveAttribute('width', '12');
    expect(svg).toHaveAttribute('height', '12');
  });
});
