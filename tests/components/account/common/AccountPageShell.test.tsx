import { render, screen } from '@testing-library/react';

import { AccountPageShell } from '@/components/account/common/AccountPageShell';

jest.mock('@/components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

jest.mock('@/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe('AccountPageShell', () => {
  it('renders header and main content', () => {
    render(
      <AccountPageShell>
        <div>Account body</div>
      </AccountPageShell>,
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Account body')).toBeInTheDocument();
  });

  it('does not render the site footer', () => {
    render(
      <AccountPageShell>
        <div>Account body</div>
      </AccountPageShell>,
    );

    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('centers content when centered is true', () => {
    const { container } = render(
      <AccountPageShell centered>
        <div>Centered</div>
      </AccountPageShell>,
    );

    expect(container.querySelector('main')?.className).toContain('items-center');
    expect(container.querySelector('main')?.className).toContain('justify-center');
  });

  it('keeps default main layout when centered is false', () => {
    const { container } = render(
      <AccountPageShell>
        <div>Default</div>
      </AccountPageShell>,
    );

    expect(container.querySelector('main')?.className).not.toContain('items-center');
  });
});
