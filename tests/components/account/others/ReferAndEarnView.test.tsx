import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReferAndEarnView } from '@/components/account/others/ReferAndEarnView';
import { accountMessages } from '@/config/account/account.config';

import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

jest.mock('@/hooks/user', () => ({
  useUserWallet: jest.fn(),
}));

import { useUserWallet } from '@/hooks/user';

const mockUseUserWallet = useUserWallet as jest.MockedFunction<typeof useUserWallet>;

describe('ReferAndEarnView', () => {
  beforeEach(() => {
    toastMock.showSuccess.mockClear();
    mockUseUserWallet.mockReset();
  });

  it('shows referral code from wallet and live referral link', () => {
    mockUseUserWallet.mockReturnValue({
      wallet: {
        email: 'a@b.com',
        phone: '',
        name: 'A',
        gender: '',
        birthdate: '',
        loyaltyPointsBalance: 0,
        refundStoreCreditBalance: 0,
        referralCode: 'PALM123',
        shopifyCustomerId: '',
        shopifyCreatedAt: '',
      },
      transactions: [],
      isLoading: false,
      error: null,
    });

    render(<ReferAndEarnView />);

    expect(
      screen.getByRole('heading', { name: accountMessages.referAndEarn.title }),
    ).toBeInTheDocument();
    expect(screen.getByText('PALM123')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: accountMessages.referAndEarn.externalCta }),
    ).toHaveAttribute('href', accountMessages.referAndEarn.externalUrl);
    expect(screen.queryByText(/How it works/i)).toBeNull();
  });

  it('copies the referral code on button click', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    mockUseUserWallet.mockReturnValue({
      wallet: {
        email: 'a@b.com',
        phone: '',
        name: 'A',
        gender: '',
        birthdate: '',
        loyaltyPointsBalance: 0,
        refundStoreCreditBalance: 0,
        referralCode: 'PALM123',
        shopifyCustomerId: '',
        shopifyCreatedAt: '',
      },
      transactions: [],
      isLoading: false,
      error: null,
    });

    render(<ReferAndEarnView />);

    await user.click(screen.getByRole('button', { name: accountMessages.a11y.copyReferralCode }));

    expect(writeText).toHaveBeenCalledWith('PALM123');
    expect(toastMock.showSuccess).toHaveBeenCalledWith(accountMessages.toasts.referralCopied);
  });

  it('shows empty copy when wallet has no referral code', () => {
    mockUseUserWallet.mockReturnValue({
      wallet: {
        email: 'a@b.com',
        phone: '',
        name: 'A',
        gender: '',
        birthdate: '',
        loyaltyPointsBalance: 0,
        refundStoreCreditBalance: 0,
        referralCode: '',
        shopifyCustomerId: '',
        shopifyCreatedAt: '',
      },
      transactions: [],
      isLoading: false,
      error: null,
    });

    render(<ReferAndEarnView />);

    expect(screen.getByText(accountMessages.referAndEarn.emptyCode)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: accountMessages.a11y.copyReferralCode })).toBeNull();
  });

  it('shows skeleton while wallet is loading', () => {
    mockUseUserWallet.mockReturnValue({
      wallet: undefined,
      transactions: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<ReferAndEarnView />);

    expect(container.querySelector('[aria-busy="true"], .animate-pulse')).toBeTruthy();
  });
});
