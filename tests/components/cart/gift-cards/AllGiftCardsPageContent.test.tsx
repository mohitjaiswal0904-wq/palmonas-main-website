import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AllGiftCardsPageContent } from '@/components/cart/gift-cards/AllGiftCardsPageContent';
import { cartMessages } from '@/config/cart/cart.config';

import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

describe('AllGiftCardsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders gift cards and redemption panel', () => {
    render(<AllGiftCardsPageContent />);

    expect(screen.getByText(cartMessages.allGiftCards)).toBeInTheDocument();
    expect(screen.getAllByTestId('gift-card-list-item').length).toBeGreaterThan(0);
    expect(screen.getByTestId('gift-card-redemption-panel')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.howRedemptionWorks)).toBeInTheDocument();
  });

  it('copies gift card code and shows copied label', async () => {
    render(<AllGiftCardsPageContent />);

    const copyButton = screen.getAllByLabelText(cartMessages.a11y.copyGiftCard)[0]!;
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(toastMock.showSuccess).toHaveBeenCalledWith(cartMessages.toasts.giftCardCopied);
      expect(copyButton).toHaveTextContent(cartMessages.copied);
    });
  });
});
