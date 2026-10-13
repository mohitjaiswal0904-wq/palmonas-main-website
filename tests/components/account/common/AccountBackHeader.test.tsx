import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
import { AccountShellNavProvider } from '@/providers/account/AccountShellNavProvider';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

jest.mock('@/components/icons/svg/account-back.svg', () => ({
  __esModule: true,
  default: { src: '/account-back.svg', height: 40, width: 40 },
}));

describe('AccountBackHeader', () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it('soft-closes to hub when shell nav is present and backHref is hub', async () => {
    const user = userEvent.setup();
    const closeToHub = jest.fn();

    render(
      <AccountShellNavProvider value={{ closeToHub }}>
        <AccountBackHeader title="Wallet" />
      </AccountShellNavProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Back to account' }));

    expect(closeToHub).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('uses router.replace for custom backHref even when shell nav is present', async () => {
    const user = userEvent.setup();
    const closeToHub = jest.fn();

    render(
      <AccountShellNavProvider value={{ closeToHub }}>
        <AccountBackHeader title="Order" backHref={ACCOUNT_ROUTES.orderHistory} />
      </AccountShellNavProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Back to account' }));

    expect(mockReplace).toHaveBeenCalledWith(ACCOUNT_ROUTES.orderHistory);
    expect(closeToHub).not.toHaveBeenCalled();
  });

  it('falls back to router.replace when outside the account shell', async () => {
    const user = userEvent.setup();

    render(<AccountBackHeader title="Wallet" />);

    await user.click(screen.getByRole('button', { name: 'Back to account' }));

    expect(mockReplace).toHaveBeenCalledWith(ACCOUNT_ROUTES.hub);
  });
});
