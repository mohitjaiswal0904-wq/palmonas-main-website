'use client';

import { fireEvent, render, screen } from '@testing-library/react';

import { CartCouponSection } from '@/components/cart/CartCouponSection';
import { cartMessages } from '@/config/cart/cart.config';
import { formatPrice } from '@/lib/format-price';

jest.mock('@/config/cart/cart.config', () => ({
  ...jest.requireActual('@/config/cart/cart.config'),
  isCartFeatureEnabled: jest.fn(() => true),
}));

const mockUseCart = jest.fn();

jest.mock('@/hooks/useCart', () => ({
  useCart: () => mockUseCart(),
}));

describe('CartCouponSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCart.mockReturnValue({
      cart: null,
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'SAVE10',
            discountDetail: 'Buy more, save more',
            amountSaved: 100,
          },
        ],
        unavailableDiscounts: [],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });
  });

  it('renders Offers & Coupons header and available ticket', () => {
    render(<CartCouponSection />);

    expect(screen.getByRole('heading', { name: cartMessages.offersAndCoupons })).toBeInTheDocument();
    expect(screen.getByTestId('cart-offer-row')).toBeInTheDocument();
    expect(screen.getByTestId('cart-coupon-save-more')).toHaveTextContent(
      cartMessages.saveMoreOnOrder,
    );
    expect(screen.queryByTestId('cart-coupon-available-count')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-coupon-applied-count')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-coupon-saving')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-have-a-code')).toHaveTextContent(cartMessages.haveACode);
    expect(screen.queryByLabelText(cartMessages.a11y.couponCodeInput)).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-see-all-coupons')).not.toBeInTheDocument();
  });

  it('auto-applies the best store offer when the cart is ready', () => {
    const applyDiscount = jest.fn().mockResolvedValue(undefined);
    mockUseCart.mockReturnValue({
      cart: { id: 'cart-1', appliedCouponCodes: [] },
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'SAVE10',
            discountDetail: 'Buy more, save more',
            amountSaved: 100,
          },
          {
            offerType: 'store_offer',
            discountCode: 'STACK40',
            discountDetail: 'Flat 40',
            amountSaved: 400,
          },
        ],
        unavailableDiscounts: [],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount,
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);

    expect(applyDiscount).toHaveBeenCalledWith('STACK40', { silent: true });
  });

  it('shows saving subtitle and applied count when a coupon is applied', () => {
    mockUseCart.mockReturnValue({
      cart: { appliedCouponCodes: ['B1G1'], discount: 2630 },
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'B1G1',
            discountDetail: 'Buy 1 get 1',
            amountSaved: 2630,
          },
          {
            offerType: 'store_offer',
            discountCode: 'BUY3',
            discountDetail: 'Buy more, save more',
          },
        ],
        unavailableDiscounts: [],
        appliedCode: 'B1G1',
        appliedAmountSaved: 2630,
        payableAfterDiscount: 1000,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);

    const amount = formatPrice(2630);
    expect(screen.getByTestId('cart-coupon-saving')).toHaveTextContent(
      `−${amount} ${cartMessages.savedLabel}`,
    );
    expect(screen.getByTestId('cart-coupon-saving-amount')).toHaveTextContent(amount);
    expect(screen.getByTestId('cart-coupon-saving-amount')).toHaveClass('font-semibold');
    expect(screen.queryByTestId('cart-coupon-applied-count')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-offer-row-applied')).toBeInTheDocument();
    expect(screen.getByText('Buy 1 get 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: cartMessages.a11y.changeOffer })).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-offer-row-applied')).toContainElement(
      screen.getByRole('button', { name: cartMessages.a11y.removeCoupon }),
    );
    expect(screen.getByTestId('cart-see-all-coupons')).toBeInTheDocument();
    expect(screen.queryByTestId('cart-offer-row')).not.toBeInTheDocument();
  });

  it('renders empty copy when no store offers are available', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      discounts: {
        availableDiscounts: [],
        unavailableDiscounts: [],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);
    expect(screen.getByTestId('cart-coupon-empty')).toHaveTextContent(cartMessages.discounts.empty);
  });

  it('prompts to add items using the first unavailable discount', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      discounts: {
        availableDiscounts: [],
        unavailableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'mangalsutra25',
            discountDetail: '25% off MANGALSUTRA',
            entitledCollectionHandles: ['mangalsutra'],
            failure_data: {
              reason: 'prerequisite_items_not_added',
              itemCountMissing: 1,
              missingEntitledDetails: { itemCountMissing: 1 },
            },
            collections: [
              {
                id: 'gid://shopify/Collection/394892443905',
                title: 'MANGALSUTRA',
                handle: 'mangalsutra',
              },
            ],
          },
          {
            offerType: 'store_offer',
            discountCode: 'monsoon2',
            discountDetail: 'Get any 2 for ₹1899',
            entitledCollectionHandles: ['monsoon-sale'],
            failure_data: { itemCountMissing: 1 },
          },
        ],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);

    expect(screen.getByTestId('cart-coupon-save-more')).toHaveTextContent(
      cartMessages.saveMoreOnOrder,
    );
    expect(screen.queryByTestId('cart-coupon-available-count')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-offer-row-unlock')).toBeInTheDocument();
    expect(screen.getByText('25% OFF MANGALSUTRA')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.discounts.unlockOne)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Add items to unlock offer mangalsutra25/i })).toHaveAttribute(
      'href',
      '/collections/mangalsutra',
    );
    expect(screen.queryByText('Get any 2 for ₹1899')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-coupon-empty')).not.toBeInTheDocument();
  });

  it('shows plural unlock hint when more than one item is missing', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      discounts: {
        availableDiscounts: [],
        unavailableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'buy2for800',
            discountDetail: 'GET 2 DEMIFINE RAKHIS AT ₹800',
            entitledCollectionHandles: ['demifine-rakhi'],
            failure_data: {
              itemCountMissing: 2,
              missingEntitledDetails: { itemCountMissing: 2 },
            },
            collections: [{ id: '1', title: 'Demifine Rakhi', handle: 'demifine-rakhi' }],
          },
        ],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);
    expect(
      screen.getByText(cartMessages.discounts.unlockMany.replace('{count}', '2')),
    ).toBeInTheDocument();
  });

  it('surfaces discount list errors', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      discounts: {
        availableDiscounts: [],
        unavailableDiscounts: [],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: 'Network failed',
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);
    expect(screen.getByTestId('cart-coupon-error')).toHaveTextContent('Network failed');
  });

  it('applies the typed coupon from the text-field Apply button', () => {
    const applyDiscount = jest.fn().mockResolvedValue(undefined);
    mockUseCart.mockReturnValue({
      cart: null,
      discounts: {
        availableDiscounts: [],
        unavailableDiscounts: [],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount,
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);
    fireEvent.click(screen.getByTestId('cart-have-a-code'));
    fireEvent.change(screen.getByLabelText(cartMessages.a11y.couponCodeInput), {
      target: { value: 'bling40' },
    });
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.applyCoupon }));

    expect(applyDiscount).toHaveBeenCalledWith('bling40');
  });

  it('shows coupon-not-applicable copy under the text field', () => {
    mockUseCart.mockReturnValue({
      cart: null,
      discounts: {
        availableDiscounts: [],
        unavailableDiscounts: [],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: cartMessages.errors.couponNotApplicable,
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);
    expect(screen.getByTestId('cart-coupon-error')).toHaveTextContent(
      cartMessages.errors.couponNotApplicable,
    );
  });

  it('hides the field after a failed typed apply and shows the next offer', async () => {
    const applyDiscount = jest.fn().mockRejectedValue(new Error('bad code'));
    mockUseCart.mockReturnValue({
      cart: null,
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'STACK40',
            discountDetail: 'Flat 40',
            amountSaved: 400,
          },
        ],
        unavailableDiscounts: [],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount,
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);
    fireEvent.click(screen.getByTestId('cart-have-a-code'));
    fireEvent.change(screen.getByLabelText(cartMessages.a11y.couponCodeInput), {
      target: { value: 'nope' },
    });
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.applyCoupon }));

    await screen.findByTestId('cart-coupon-try-instead');
    expect(screen.getByTestId('cart-coupon-fail')).toBeInTheDocument();
    expect(screen.getByTestId('cart-coupon-try-instead')).toHaveTextContent('Try STACK40 instead');
    expect(screen.queryByLabelText(cartMessages.a11y.couponCodeInput)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.differentCode })).toBeInTheDocument();
  });

  it('expands in-house store tickets inside the section and ignores payment offers', () => {
    mockUseCart.mockReturnValue({
      cart: { appliedCouponCodes: ['B1G1'], discount: 100 },
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'B1G1',
            discountDetail: 'Buy 1 get 1',
            amountSaved: 100,
          },
          {
            offerType: 'store_offer',
            discountCode: 'STACK2',
            discountDetail: 'Get any 2 for ₹1899',
            amountSaved: 99,
          },
          {
            offerType: 'payment_offer',
            discountCode: 'PAY10',
            discountDetail: '10% on cards',
            paymentOfferTitle: 'HDFC 10%',
            viewInListing: true,
          },
        ],
        unavailableDiscounts: [],
        appliedCode: 'B1G1',
        appliedAmountSaved: 100,
        payableAfterDiscount: 1000,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);

    const toggle = screen.getByTestId('cart-see-all-coupons');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('cart-more-store-offers')).not.toBeInTheDocument();
    expect(screen.queryByText('HDFC 10%')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('cart-more-store-offers')).toBeInTheDocument();
    expect(screen.getByText('STACK2')).toBeInTheDocument();
    expect(screen.getByText('Get any 2 for ₹1899')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `${cartMessages.apply} STACK2` })).toBeInTheDocument();
    expect(screen.queryByText('PAY10')).not.toBeInTheDocument();
    expect(screen.queryByText('HDFC 10%')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-coupon-section')).toContainElement(toggle);
  });

  it('shows More offers when other in-house codes sit in unavailable', () => {
    mockUseCart.mockReturnValue({
      cart: { appliedCouponCodes: ['STACK2'], discount: 99 },
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'STACK2',
            discountDetail: 'Get any 2 for ₹1899',
            amountSaved: 99,
          },
        ],
        unavailableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'SAVE10',
            discountDetail: 'Buy more, save more',
            entitledCollectionHandles: ['best-sellers'],
            failure_data: { itemCountMissing: 1 },
          },
        ],
        appliedCode: 'STACK2',
        appliedAmountSaved: 99,
        payableAfterDiscount: 1800,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);

    fireEvent.click(screen.getByTestId('cart-see-all-coupons'));
    expect(screen.getByTestId('cart-more-store-offers')).toBeInTheDocument();
    expect(screen.getByText('BUY MORE, SAVE MORE')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.discounts.unlockOne)).toBeInTheDocument();
  });

  it('shows a swap row when another store offer saves more than the applied code', () => {
    mockUseCart.mockReturnValue({
      cart: { appliedCouponCodes: ['STACK2'], discount: 99 },
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'STACK2',
            discountDetail: 'Get any 2 for ₹1899',
            amountSaved: 99,
          },
          {
            offerType: 'store_offer',
            discountCode: 'STACK3',
            discountDetail: 'Get any 3 for ₹2499',
            amountSaved: 299,
          },
        ],
        unavailableDiscounts: [],
        appliedCode: 'STACK2',
        appliedAmountSaved: 99,
        payableAfterDiscount: 1800,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount: jest.fn(),
        removeDiscount: jest.fn(),
      },
    });

    render(<CartCouponSection />);

    expect(screen.getByTestId('cart-offer-swap')).toBeInTheDocument();
    expect(screen.getByText('STACK3')).toBeInTheDocument();
    expect(screen.getByText('+₹200 extra')).toBeInTheDocument();
    expect(screen.getByTestId('cart-offer-swap-button')).toBeInTheDocument();
    expect(screen.getByTestId('cart-offer-row-applied')).toHaveTextContent('STACK2');
    expect(screen.queryByTestId('cart-see-all-coupons')).not.toBeInTheDocument();
  });

  it('applies the better code from Swap and hides swap when that code is applied', async () => {
    const applyDiscount = jest.fn().mockResolvedValue(undefined);
    mockUseCart.mockReturnValue({
      cart: { appliedCouponCodes: ['STACK2'], discount: 99 },
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'STACK2',
            discountDetail: 'Get any 2',
            amountSaved: 99,
          },
          {
            offerType: 'store_offer',
            discountCode: 'STACK3',
            discountDetail: 'Get any 3',
            amountSaved: 299,
          },
        ],
        unavailableDiscounts: [],
        appliedCode: 'STACK2',
        appliedAmountSaved: 99,
        payableAfterDiscount: 1800,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount,
        removeDiscount: jest.fn(),
      },
    });

    const { rerender } = render(<CartCouponSection />);
    fireEvent.click(screen.getByTestId('cart-offer-swap-button'));
    expect(applyDiscount).toHaveBeenCalledWith('STACK3');

    mockUseCart.mockReturnValue({
      cart: { appliedCouponCodes: ['STACK3'], discount: 299 },
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'STACK3',
            discountDetail: 'Get any 3',
            amountSaved: 299,
          },
          {
            offerType: 'store_offer',
            discountCode: 'STACK2',
            discountDetail: 'Get any 2',
            amountSaved: 99,
          },
        ],
        unavailableDiscounts: [],
        appliedCode: 'STACK3',
        appliedAmountSaved: 299,
        payableAfterDiscount: 1600,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: {
        applyDiscount,
        removeDiscount: jest.fn(),
      },
    });
    rerender(<CartCouponSection />);

    expect(screen.queryByTestId('cart-offer-swap')).not.toBeInTheDocument();
    expect(screen.getByTestId('cart-offer-row-applied')).toHaveTextContent('STACK3');
  });
});
