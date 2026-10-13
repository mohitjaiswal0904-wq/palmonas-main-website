import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AllOffersPageContent } from '@/components/cart/offers/AllOffersPageContent';
import { cartMessages } from '@/config/cart/cart.config';

const mockReplace = jest.fn();
const mockApplyDiscount = jest.fn();
const mockUseCart = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => mockUseCart(),
}));

describe('AllOffersPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApplyDiscount.mockResolvedValue(undefined);
    mockUseCart.mockReturnValue({
      discounts: {
        availableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'monsoon3',
            discountDetail: 'Get any 3 for ₹2699',
            amountSaved: 298,
          },
          {
            offerType: 'payment_offer',
            discountCode: 'NAVIUPI',
            discountDetail: 'Upto ₹100 cashback',
            paymentOfferTitle: 'Upto ₹100 cashback on using Navi UPI',
            paymentOfferSubTitle: 'No minimum order value',
            viewInListing: true,
            logoUrl: 'https://example.com/navi.svg',
          },
        ],
        unavailableDiscounts: [
          {
            offerType: 'store_offer',
            discountCode: 'eoss',
            discountDetail: 'Buy 1 Get 1 Free',
            failure_data: { reason: 'bxgy_items_not_added' },
          },
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
        ],
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      },
      discountsLoading: false,
      discountsError: null,
      isDiscountMutating: false,
      actions: { applyDiscount: mockApplyDiscount },
    });
  });

  it('renders store and payment offer grids', () => {
    render(<AllOffersPageContent />);

    expect(screen.getByText(cartMessages.allOffers)).toBeInTheDocument();
    expect(screen.getByText(cartMessages.discounts.storeOffers)).toBeInTheDocument();
    expect(screen.getByText(cartMessages.discounts.paymentOffers)).toBeInTheDocument();
    expect(screen.getByText('MONSOON3')).toBeInTheDocument();
    expect(screen.getByText('Get any 3 for ₹2699')).toBeInTheDocument();
    expect(screen.getByText('SAVE ₹298')).toBeInTheDocument();
    expect(screen.getByText('NAVIUPI')).toBeInTheDocument();
    expect(screen.getByText('EOSS')).toBeInTheDocument();
    expect(screen.getByText('Buy 1 Get 1 Free')).toBeInTheDocument();
  });

  it('applies store offer and navigates back to cart', async () => {
    render(<AllOffersPageContent />);

    fireEvent.click(screen.getByRole('button', { name: `${cartMessages.applyCode} MONSOON3` }));

    await waitFor(() => {
      expect(mockApplyDiscount).toHaveBeenCalledWith('monsoon3');
      expect(mockReplace).toHaveBeenCalledWith('/cart');
    });
  });

  it('shows skeletons while discounts load', () => {
    mockUseCart.mockReturnValue({
      discounts: null,
      discountsLoading: true,
      discountsError: null,
      isDiscountMutating: false,
      actions: { applyDiscount: mockApplyDiscount },
    });

    render(<AllOffersPageContent />);

    expect(screen.getByTestId('cart-offers-page-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('all-offers-skeleton')).toBeInTheDocument();
    expect(screen.getAllByTestId('offer-list-card-skeleton').length).toBeGreaterThan(0);
  });

  it('does not show apply on payment or unavailable offers', () => {
    render(<AllOffersPageContent />);

    expect(
      screen.queryByRole('button', { name: `${cartMessages.applyCode} NAVIUPI` }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: `${cartMessages.applyCode} eoss` }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: `${cartMessages.applyCode} MANGALSUTRA25` }),
    ).not.toBeInTheDocument();
  });

  it('links unavailable offers with collections to Add Items unlock CTA', () => {
    render(<AllOffersPageContent />);

    expect(
      screen.getByText(cartMessages.discounts.unlockOne.toUpperCase()),
    ).toBeInTheDocument();
    const addItems = screen.getByRole('link', {
      name: cartMessages.a11y.addItemsForOffer.replace('{code}', 'MANGALSUTRA25'),
    });
    expect(addItems).toHaveAttribute('href', '/collections/mangalsutra');
    expect(addItems).toHaveTextContent(cartMessages.addItems);
  });
});
