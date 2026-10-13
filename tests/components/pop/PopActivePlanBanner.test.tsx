import { render, screen } from '@testing-library/react';

import { PopActivePlanBanner } from '@/components/pop/PopActivePlanBanner';
import { popActivePlanMessages } from '@/config/pop.config';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('PopActivePlanBanner', () => {
  it('renders title and subtitle', () => {
    render(<PopActivePlanBanner />);

    expect(screen.getByText(popActivePlanMessages.title)).toBeInTheDocument();
    expect(screen.getByText(popActivePlanMessages.subtitle)).toBeInTheDocument();
  });

  it('links to the my-plan page', () => {
    render(<PopActivePlanBanner />);

    expect(screen.getByRole('link', { name: popActivePlanMessages.linkAriaLabel })).toHaveAttribute(
      'href',
      '/pop/my-plan',
    );
  });
});
