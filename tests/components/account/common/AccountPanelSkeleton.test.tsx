import { render, screen } from '@testing-library/react';

import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';

describe('AccountPanelSkeleton', () => {
  it('exposes a busy loading region', () => {
    render(<AccountPanelSkeleton />);

    expect(screen.getByLabelText('Loading account section')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders pulse placeholders', () => {
    const { container } = render(<AccountPanelSkeleton />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});
