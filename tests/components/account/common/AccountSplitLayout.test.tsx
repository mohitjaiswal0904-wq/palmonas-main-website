import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccountSplitLayout } from '@/components/account/common/AccountSplitLayout';

let mockPathname = '/account';
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    replace: jest.fn(),
    push: mockPush,
  }),
}));

jest.mock('@/components/icons/svg/account-back.svg', () => ({
  __esModule: true,
  default: { src: '/account-back.svg', height: 40, width: 40 },
}));

jest.mock('@/components/account/common/AccountHub', () => ({
  AccountHub: ({
    onSelectPanel,
    activePanelId,
  }: {
    onSelectPanel: (id: string, href: string) => void;
    activePanelId?: string | null;
  }) => (
    <div>
      <span data-testid="active-panel">{activePanelId ?? 'none'}</span>
      <button type="button" onClick={() => onSelectPanel('wallet', '/account/wallet')}>
        Open wallet
      </button>
      <button type="button" onClick={() => onSelectPanel('order-history', '/account/order-history')}>
        Open orders
      </button>
      <button type="button" onClick={() => onSelectPanel('wishlist', '/wishlist')}>
        Open wishlist
      </button>
      <button type="button" onClick={() => onSelectPanel('plan-of-purchase', '/pop')}>
        Open POP
      </button>
    </div>
  ),
}));

jest.mock('@/components/account/common/AccountPanelRenderer', () => {
  const { AccountBackHeader } = require('@/components/account/common/AccountBackHeader');

  return {
    AccountPanelRenderer: ({ panelId }: { panelId: string }) => (
      <div>
        <AccountBackHeader title={panelId} />
        <div data-testid="panel">{panelId}</div>
      </div>
    ),
  };
});

describe('AccountSplitLayout', () => {
  beforeEach(() => {
    mockPathname = '/account';
    mockPush.mockReset();
    window.history.replaceState(null, '', '/account');
  });

  it('shows hub only on /account', () => {
    render(
      <AccountSplitLayout>
        <div>children</div>
      </AccountSplitLayout>,
    );

    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open wallet' })).toBeInTheDocument();
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    expect(screen.getByText('children')).not.toBeVisible();
  });

  it('shows a skeleton then the panel without Next router navigation', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const pushStateSpy = jest.spyOn(window.history, 'pushState');

    render(
      <AccountSplitLayout>
        <div>children</div>
      </AccountSplitLayout>,
    );

    await user.click(screen.getByRole('button', { name: 'Open wallet' }));

    expect(screen.getByLabelText('Loading account section')).toBeInTheDocument();
    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ __accountShell: 'panel' }),
      '',
      '/account/wallet',
    );
    expect(screen.getByTestId('active-panel')).toHaveTextContent('wallet');

    await jest.advanceTimersByTimeAsync(320);

    await waitFor(() => {
      expect(screen.getByTestId('panel')).toHaveTextContent('wallet');
    });

    pushStateSpy.mockRestore();
    jest.useRealTimers();
  });

  it('replaces history when switching between panels', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const pushStateSpy = jest.spyOn(window.history, 'pushState');
    const replaceStateSpy = jest.spyOn(window.history, 'replaceState');

    render(
      <AccountSplitLayout>
        <div>children</div>
      </AccountSplitLayout>,
    );

    await user.click(screen.getByRole('button', { name: 'Open wallet' }));
    await jest.advanceTimersByTimeAsync(320);
    await waitFor(() => {
      expect(screen.getByTestId('panel')).toHaveTextContent('wallet');
    });

    pushStateSpy.mockClear();
    replaceStateSpy.mockClear();

    await user.click(screen.getByRole('button', { name: 'Open orders' }));

    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ __accountShell: 'panel' }),
      '',
      '/account/order-history',
    );

    pushStateSpy.mockRestore();
    replaceStateSpy.mockRestore();
    jest.useRealTimers();
  });

  it('navigates to /pop for Plan of Purchase instead of an in-shell panel', async () => {
    const user = userEvent.setup();

    render(
      <AccountSplitLayout>
        <div>children</div>
      </AccountSplitLayout>,
    );

    await user.click(screen.getByRole('button', { name: 'Open POP' }));

    expect(mockPush).toHaveBeenCalledWith('/pop');
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
  });

  it('navigates to /wishlist instead of an in-shell panel', async () => {
    const user = userEvent.setup();

    render(
      <AccountSplitLayout>
        <div>children</div>
      </AccountSplitLayout>,
    );

    await user.click(screen.getByRole('button', { name: 'Open wishlist' }));

    expect(mockPush).toHaveBeenCalledWith('/wishlist');
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
  });

  it('seeds hub under a deep-linked panel for native Back', () => {
    mockPathname = '/account/wallet';
    window.history.replaceState(null, '', '/account/wallet');

    const replaceStateSpy = jest.spyOn(window.history, 'replaceState');
    const pushStateSpy = jest.spyOn(window.history, 'pushState');

    render(
      <AccountSplitLayout>
        <div>children</div>
      </AccountSplitLayout>,
    );

    expect(screen.getByTestId('panel')).toHaveTextContent('wallet');
    expect(replaceStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ __accountShell: 'hub' }),
      '',
      '/account',
    );
    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ __accountShell: 'panel' }),
      '',
      '/account/wallet',
    );

    replaceStateSpy.mockRestore();
    pushStateSpy.mockRestore();
  });

  it('renders nested detail children instead of a panel', () => {
    mockPathname = '/account/order-history/ord_1';

    render(
      <AccountSplitLayout>
        <div data-testid="detail">Order detail</div>
      </AccountSplitLayout>,
    );

    expect(screen.getByTestId('detail')).toBeInTheDocument();
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
  });

  it('soft-closes back to the hub without Next router navigation', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const backSpy = jest.spyOn(window.history, 'back');

    render(
      <AccountSplitLayout>
        <div>children</div>
      </AccountSplitLayout>,
    );

    await user.click(screen.getByRole('button', { name: 'Open wallet' }));
    await jest.advanceTimersByTimeAsync(320);

    await waitFor(() => {
      expect(screen.getByTestId('panel')).toHaveTextContent('wallet');
    });

    await user.click(screen.getByRole('button', { name: 'Back to account' }));

    expect(backSpy).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('active-panel')).toHaveTextContent('none');

    backSpy.mockRestore();
    jest.useRealTimers();
  });

  it('falls back to replaceState when soft-closing without a panel history marker', async () => {
    mockPathname = '/account/wallet';
    window.history.replaceState({ __accountShell: 'hub' }, '', '/account/wallet');

    const user = userEvent.setup();
    const replaceStateSpy = jest.spyOn(window.history, 'replaceState');
    const backSpy = jest.spyOn(window.history, 'back');

    render(
      <AccountSplitLayout>
        <div>children</div>
      </AccountSplitLayout>,
    );

    // Seed may push a panel marker; clear marker to exercise fallback.
    window.history.replaceState({ __accountShell: 'hub' }, '', '/account/wallet');
    replaceStateSpy.mockClear();
    backSpy.mockClear();

    await user.click(screen.getByRole('button', { name: 'Back to account' }));

    expect(backSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ __accountShell: 'hub' }),
      '',
      '/account',
    );
    expect(screen.queryByTestId('panel')).not.toBeInTheDocument();

    replaceStateSpy.mockRestore();
    backSpy.mockRestore();
  });
});
