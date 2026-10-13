import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { CartItemCard } from '@/components/cart/CartItemCard';
import { cartMessages } from '@/config/cart/cart.config';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children?: ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@/providers/navigation/NavigationPendingProvider', () => ({
  useNavigationPending: () => ({
    pendingHref: null,
    startNavigation: jest.fn(),
    clearNavigation: jest.fn(),
  }),
}));

describe('CartItemCard', () => {
  it('disables minus at quantity 1 and does not open remove', () => {
    const onRemove = jest.fn();
    const onDecrease = jest.fn();

    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Rose Gold"
        price={100}
        quantity={1}
        onRemove={onRemove}
        onDecrease={onDecrease}
        onIncrease={jest.fn()}
      />,
    );

    const minus = screen.getByLabelText(cartMessages.a11y.decreaseQuantity);
    expect(minus).toBeDisabled();
    fireEvent.click(minus);
    expect(onDecrease).not.toHaveBeenCalled();
    expect(screen.queryByText(cartMessages.removeConfirm.title)).not.toBeInTheDocument();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('opens remove modal when trash is clicked and confirms removal', async () => {
    const onRemove = jest.fn().mockImplementation(
      () => new Promise<void>((resolve) => setTimeout(resolve, 50)),
    );

    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Rose Gold"
        price={100}
        quantity={1}
        onRemove={onRemove}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    const trash = screen.getByLabelText(cartMessages.a11y.removeItem);
    const icon = trash.querySelector('svg');
    expect(icon).toHaveClass('h-[14.4px]', 'w-[14.4px]', 'laptop:h-[22px]', 'laptop:w-[22px]');

    fireEvent.click(trash);
    expect(screen.getByText(cartMessages.removeConfirm.title)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: cartMessages.removeConfirm.remove }));
    expect(onRemove).toHaveBeenCalled();

    const wishlistButton = screen.getByRole('button', {
      name: cartMessages.removeConfirm.moveToWishlist,
    });
    expect(wishlistButton).toBeDisabled();
    expect(wishlistButton).not.toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText(cartMessages.removeConfirm.moveToWishlist)).toBeInTheDocument();
  });

  it('renders Colour and Size variant lines', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Rose Gold / 7"
        price={100}
        originalPrice={120}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.getByText('Colour : Rose Gold')).toBeInTheDocument();
    expect(screen.getByText('Size : 7')).toBeInTheDocument();
    expect(screen.getByLabelText(cartMessages.a11y.removeItem)).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-card')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-card')).toHaveClass(
      'rounded-[16.525px]',
      'border-[1.377px]',
      'border-[#e2e8f0]',
    );
    const thumb = screen.getByTestId('cart-item-card').querySelector('.h-20');
    expect(thumb).toHaveClass('h-20', 'w-20', 'laptop:h-[142px]', 'laptop:w-[142px]');
    expect(screen.getByTestId('cart-quantity-stepper')).toHaveClass('rounded', 'p-1');
    expect(screen.getByLabelText(cartMessages.a11y.decreaseQuantity)).toBeDisabled();
    expect(screen.getByLabelText(cartMessages.a11y.increaseQuantity)).toHaveTextContent('+');
  });

  it('renders size for numeric variant titles', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="8"
        price={100}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.getByText('Size : 8')).toBeInTheDocument();
    expect(screen.queryByText('Colour : 8')).not.toBeInTheDocument();
  });

  it('hides Default Title variant rows', () => {
    render(
      <CartItemCard
        name="Bracelet"
        image=""
        variantTitle="Default Title"
        price={100}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.queryByText(/Colour :/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Size :/)).not.toBeInTheDocument();
  });

  it('calls onDecrease when quantity is greater than 1', () => {
    const onRemove = jest.fn();
    const onDecrease = jest.fn();

    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Rose Gold"
        price={100}
        quantity={2}
        onRemove={onRemove}
        onDecrease={onDecrease}
        onIncrease={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText(cartMessages.a11y.decreaseQuantity));

    expect(onDecrease).toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('disables stepper while updating', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Rose Gold"
        price={100}
        quantity={1}
        isUpdating
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.getByLabelText(cartMessages.a11y.increaseQuantity)).toBeDisabled();
  });

  it('omits compare-at price when original is not higher than selling price', () => {
    render(
      <CartItemCard
        name="Ring"
        image="https://cdn.example.com/ring.jpg"
        variantTitle=""
        price={100}
        originalPrice={100}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.queryByText('₹100')).toBeInTheDocument();
    expect(screen.queryByText('Colour :')).not.toBeInTheDocument();
  });

  it('shows freebie badge and strikethrough MRP for promotional lines', () => {
    render(
      <CartItemCard
        name="Necklace"
        image=""
        variantTitle="Default Title"
        price={0}
        originalPrice={3567}
        quantity={1}
        isFree
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.getByTestId('cart-item-freebie-badge')).toHaveTextContent(
      cartMessages.freebieBadge,
    );
    expect(screen.getByTestId('cart-item-freebie-badge')).toHaveClass('py-0', 'px-1');
    expect(screen.getAllByText(cartMessages.free)).toHaveLength(1);
    expect(screen.getByText('₹3,567')).toBeInTheDocument();
    expect(screen.queryByLabelText(cartMessages.a11y.removeItem)).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-quantity-stepper')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-item-free-quantity')).toHaveTextContent('Qty: 1');
  });

  it('shows free quantity when multiple free units are on the line', () => {
    render(
      <CartItemCard
        name="Necklace"
        image=""
        variantTitle="Default Title"
        price={0}
        quantity={2}
        isFree
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.getByTestId('cart-item-free-quantity')).toHaveTextContent('Qty: 2');
  });

  it('shows includes-free subtitle for clubbed paid + free rows', () => {
    render(
      <CartItemCard
        name="Necklace"
        image=""
        variantTitle="Default Title"
        price={6493}
        quantity={2}
        freeQuantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.getByTestId('cart-item-includes-free')).toHaveTextContent('Includes 1 free');
    expect(screen.queryByTestId('cart-item-freebie-badge')).not.toBeInTheDocument();
  });

  it('clears wishlist CTA spinner and keeps confirm modal when move-to-wishlist is cancelled', async () => {
    const onMoveToWishlist = jest.fn().mockRejectedValue(new Error('LOGIN_CANCELLED'));

    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Rose Gold"
        price={100}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
        onMoveToWishlist={onMoveToWishlist}
      />,
    );

    fireEvent.click(screen.getByLabelText(cartMessages.a11y.removeItem));
    fireEvent.click(screen.getByRole('button', { name: cartMessages.removeConfirm.moveToWishlist }));

    await waitFor(() => {
      expect(onMoveToWishlist).toHaveBeenCalled();
    });

    expect(screen.getByText(cartMessages.removeConfirm.title)).toBeInTheDocument();
    await waitFor(() => {
      const wishlistButton = screen.getByRole('button', {
        name: cartMessages.removeConfirm.moveToWishlist,
      });
      expect(wishlistButton).not.toBeDisabled();
      expect(wishlistButton).not.toHaveAttribute('aria-busy', 'true');
    });
    expect(screen.getByText(cartMessages.removeConfirm.moveToWishlist)).toBeInTheDocument();
  });

  it('renders only line offers that intersect available store offers for this card', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Silver"
        price={3569}
        originalPrice={5099}
        quantity={1}
        applicableDiscounts={[
          { key: 'MONSOON4', label: 'Buy 4 At ₹2999', code: 'MONSOON4' },
          { key: 'B1G1', label: 'Buy 1 Get 1', code: 'B1G1' },
          { key: 'BDAY3', label: 'Buy 3 At ₹2999', code: 'BDAY3' },
        ]}
        availableOffers={[
          {
            offerType: 'store_offer',
            discountCode: 'B1G1',
            discountDetail: 'Buy 1 Get 1 Free',
          },
          {
            offerType: 'store_offer',
            discountCode: 'MONSOON4',
            discountDetail: 'Buy 4 at 2999',
          },
        ]}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    const list = screen.getByTestId('cart-item-applicable-discounts');
    expect(list).toHaveAttribute('aria-label', cartMessages.a11y.lineOffers);
    expect(screen.getByText('Buy 4 At ₹2999')).toBeInTheDocument();
    expect(screen.getByText('Buy 1 Get 1')).toBeInTheDocument();
    expect(screen.queryByText('Buy 3 At ₹2999')).not.toBeInTheDocument();
  });

  it('hides discount badges when available offers do not intersect this card', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Silver"
        price={100}
        quantity={1}
        applicableDiscounts={[{ key: 'BDAY3', label: 'Buy 3 At ₹2999', code: 'BDAY3' }]}
        availableOffers={[
          {
            offerType: 'store_offer',
            discountCode: 'B1G1',
            discountDetail: 'Buy 1 Get 1 Free',
          },
        ]}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('cart-item-applicable-discounts')).not.toBeInTheDocument();
  });

  it('renders applied line allocations as a solid green Figma pill', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Silver"
        price={3569}
        originalPrice={5099}
        quantity={2}
        lineDiscountAllocations={[
          { key: 'mega40', title: 'mega40', amount: 90320, valueType: 'fixed_amount' },
        ]}
        applicableDiscounts={[{ key: 'mega40', label: 'Flat 40% Off', code: 'mega40' }]}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    const list = screen.getByTestId('cart-item-applied-discounts');
    expect(list).toHaveAttribute('aria-label', cartMessages.a11y.lineDiscountsApplied);
    const badge = screen.getByText('Flat 40% Off Applied');
    expect(badge).toHaveStyle({
      backgroundColor: '#006045',
      color: '#ffffff',
    });
    expect(screen.queryByTestId('cart-item-applicable-discounts')).not.toBeInTheDocument();
  });

  it('hides applied allocation badges when the list is empty', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Silver"
        price={100}
        quantity={1}
        lineDiscountAllocations={[]}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('cart-item-applied-discounts')).not.toBeInTheDocument();
  });

  it('hides discount badges when none are provided', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Silver"
        price={100}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('cart-item-applicable-discounts')).not.toBeInTheDocument();
  });

  it('links the card to the product page using the API handle', () => {
    render(
      <CartItemCard
        name="Classic Emerald Necklace"
        handle="classic-emerald-necklace-91717"
        image=""
        variantTitle="Default Title"
        price={999}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'View Classic Emerald Necklace' }),
    ).toHaveAttribute('href', '/products/classic-emerald-necklace-91717');
  });

  it('encodes the product handle in the PDP href', () => {
    render(
      <CartItemCard
        name="Ring"
        handle="rose gold ring"
        image=""
        variantTitle="Default Title"
        price={100}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'View Ring' })).toHaveAttribute(
      'href',
      '/products/rose%20gold%20ring',
    );
  });

  it('does not link to PDP when the handle is missing', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Gold"
        price={100}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.queryByRole('link', { name: 'View Ring' })).not.toBeInTheDocument();
  });

  it('does not link to PDP when the handle is blank', () => {
    render(
      <CartItemCard
        name="Ring"
        handle="   "
        image=""
        variantTitle="Gold"
        price={100}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.queryByRole('link', { name: 'View Ring' })).not.toBeInTheDocument();
  });

  it('keeps remove controls usable when the card links to PDP', () => {
    const onRemove = jest.fn();

    render(
      <CartItemCard
        name="Ring"
        handle="classic-emerald-necklace-91717"
        image=""
        variantTitle="Gold"
        price={100}
        quantity={1}
        onRemove={onRemove}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText(cartMessages.a11y.removeItem));

    expect(screen.getByText(cartMessages.removeConfirm.title)).toBeInTheDocument();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('shows an Out of Stock badge on the thumbnail when the line is unavailable', () => {
    render(
      <CartItemCard
        name="Emerald Glow Hand Harness Bracelet"
        image=""
        variantTitle="Default Title"
        price={2029}
        originalPrice={2899}
        quantity={1}
        isAvailable={false}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    const status = screen.getByTestId('cart-item-out-of-stock');
    expect(status).toHaveTextContent(cartMessages.outOfStock);
    expect(status).toHaveAttribute('aria-label', cartMessages.a11y.outOfStock);
    expect(status).toHaveStyle({ backgroundColor: '#E11D2E' });
    expect(status).toHaveClass('inset-x-0', 'w-full');
    expect(screen.getByTestId('cart-item-card')).toHaveAttribute('data-out-of-stock', 'true');
    expect(screen.getByTestId('cart-item-card')).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not link the card to PDP when the line is out of stock', () => {
    render(
      <CartItemCard
        name="The Statement Maker"
        handle="the-statement-maker-14795"
        image=""
        variantTitle="Default Title"
        price={100}
        quantity={1}
        isAvailable={false}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole('link', { name: 'View The Statement Maker' }),
    ).not.toBeInTheDocument();
  });

  it('does not show Out of Stock when the line is available', () => {
    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Gold"
        price={100}
        quantity={1}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('cart-item-out-of-stock')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-item-card')).not.toHaveAttribute('data-out-of-stock');
  });

  it('blocks quantity increase when the line is out of stock', () => {
    const onIncrease = jest.fn();
    const onDecrease = jest.fn();

    render(
      <CartItemCard
        name="Ring"
        image=""
        variantTitle="Gold"
        price={100}
        quantity={2}
        isAvailable={false}
        onRemove={jest.fn()}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
      />,
    );

    expect(screen.getByLabelText(cartMessages.a11y.increaseQuantity)).toBeDisabled();
    expect(screen.getByLabelText(cartMessages.a11y.decreaseQuantity)).toBeDisabled();
    expect(screen.getByTestId('cart-quantity-stepper')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('cart-quantity-stepper')).toHaveClass('opacity-50');
    expect(screen.getByTestId('cart-quantity-value')).toHaveTextContent('2');
    fireEvent.click(screen.getByLabelText(cartMessages.a11y.increaseQuantity));
    fireEvent.click(screen.getByLabelText(cartMessages.a11y.decreaseQuantity));
    expect(onIncrease).not.toHaveBeenCalled();
    expect(onDecrease).not.toHaveBeenCalled();
  });

  it('still opens remove confirm when the line is out of stock', () => {
    render(
      <CartItemCard
        name="Ring"
        handle="the-statement-maker-14795"
        image=""
        variantTitle="Gold"
        price={100}
        quantity={1}
        isAvailable={false}
        onRemove={jest.fn()}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText(cartMessages.a11y.removeItem));
    expect(screen.getByText(cartMessages.removeConfirm.title)).toBeInTheDocument();
  });
});
