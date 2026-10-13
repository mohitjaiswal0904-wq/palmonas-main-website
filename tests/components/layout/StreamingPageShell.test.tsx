import { render, screen } from '@testing-library/react';

import { resetStableMainCache } from '@/components/layout/StableMainSuspense';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

jest.mock('@/components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

jest.mock('@/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe('StreamingPageShell', () => {
  beforeEach(() => {
    resetStableMainCache();
  });

  it('renders streamed chrome around main children', () => {
    render(
      <StreamingPageShell>
        <main>Body</main>
      </StreamingPageShell>,
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('accepts a custom main fallback for suspended page bodies', () => {
    render(
      <StreamingPageShell mainFallback={<div>Main fallback</div>}>
        <main>Body</main>
      </StreamingPageShell>,
    );

    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.queryByText('Main fallback')).not.toBeInTheDocument();
  });

  it('omits the footer when showFooter is false', () => {
    render(
      <StreamingPageShell showFooter={false}>
        <main>Body</main>
      </StreamingPageShell>,
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });
});
