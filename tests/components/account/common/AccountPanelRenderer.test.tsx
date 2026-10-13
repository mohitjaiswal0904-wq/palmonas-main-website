import { render, screen } from '@testing-library/react';

import { AccountPanelRenderer } from '@/components/account/common/AccountPanelRenderer';
import { accountMessages } from '@/config/account/account.config';
import {
  accountFaqsContent,
  accountSupportContent,
} from '@/config/account/account.config';

describe('AccountPanelRenderer feature flags', () => {
  it('shows disabled placeholder for refer-and-earn when flag off', () => {
    render(<AccountPanelRenderer panelId="refer-and-earn" />);

    expect(
      screen.getByRole('region', { name: accountMessages.disabled.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(accountMessages.disabled.description)).toBeInTheDocument();
  });

  it('renders support panel when flag on', () => {
    render(<AccountPanelRenderer panelId="support" />);

    expect(
      screen.getByRole('heading', { name: accountSupportContent.pageTitle }),
    ).toBeInTheDocument();
  });

  it('renders faqs panel when flag on', () => {
    render(<AccountPanelRenderer panelId="faqs" />);

    expect(
      screen.getByRole('heading', { name: accountFaqsContent.pageTitle }),
    ).toBeInTheDocument();
  });
});
