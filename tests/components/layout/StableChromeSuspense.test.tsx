import { render, screen } from '@testing-library/react';

import { StableChromeSuspense } from '@/components/layout/StableChromeSuspense';

describe('StableChromeSuspense', () => {
  it('renders resolved children', () => {
    render(
      <StableChromeSuspense fallback={<div>Loading chrome</div>}>
        <header>Site header</header>
      </StableChromeSuspense>,
    );

    expect(screen.getByText('Site header')).toBeInTheDocument();
    expect(screen.queryByText('Loading chrome')).not.toBeInTheDocument();
  });
});
