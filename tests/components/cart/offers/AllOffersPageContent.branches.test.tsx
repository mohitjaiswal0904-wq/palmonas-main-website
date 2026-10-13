import { render, screen } from '@testing-library/react';

import { AllOffersPageContent } from '@/components/cart/offers/AllOffersPageContent';
import { cartMessages } from '@/config/cart/cart.config';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    discounts: {
      availableDiscounts: [
        {
          offerType: 'store_offer',
          discountCode: 'FEAT10',
          discountDetail: 'Featured only',
          amountSaved: 10,
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
    actions: { applyDiscount: jest.fn() },
  }),
}));

describe('AllOffersPageContent branches', () => {
  it('hides payment offers section when none exist', () => {
    render(<AllOffersPageContent />);

    expect(screen.getByText(cartMessages.allOffers)).toBeInTheDocument();
    expect(screen.getByText(cartMessages.discounts.storeOffers)).toBeInTheDocument();
    expect(screen.queryByText(cartMessages.discounts.paymentOffers)).not.toBeInTheDocument();
    expect(screen.getAllByTestId('offer-list-card')).toHaveLength(1);
  });
});
