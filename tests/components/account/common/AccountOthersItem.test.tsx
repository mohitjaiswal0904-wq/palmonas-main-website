import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccountOthersItem } from '@/components/account/common/AccountOthersItem';

const mockLogout = jest.fn();

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({ logout: mockLogout, isLoggingOut: false }),
}));

describe('AccountOthersItem', () => {
  beforeEach(() => {
    mockLogout.mockReset();
  });

  it('renders each row with the design shadow card treatment', () => {
    render(
      <AccountOthersItem
        item={{ id: 'faqs', title: 'FAQs', href: '/account/faqs' }}
        onSelectPanel={jest.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'FAQs' });
    expect(button.className).toContain('shadow-[0_2px_8px_rgba(0,0,0,0.06)]');
  });

  it('highlights the active other row', () => {
    render(
      <AccountOthersItem
        item={{ id: 'faqs', title: 'FAQs', href: '/account/faqs' }}
        isActive
        onSelectPanel={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'FAQs' })).toHaveAttribute('aria-current', 'page');
  });

  it('delegates logout handling to the auth provider', async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValue(undefined);

    render(
      <AccountOthersItem
        item={{ id: 'logout', title: 'Logout', href: '/', action: 'logout' }}
        onSelectPanel={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
