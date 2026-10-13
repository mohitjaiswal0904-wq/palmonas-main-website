import { render, screen } from '@testing-library/react';

import {
  FooterSkeleton,
  HeaderSkeleton,
  MainContentSkeleton,
  PageChromeSkeleton,
} from '@/components/layout/PageChromeSkeleton';

describe('PageChromeSkeleton', () => {
  it('renders header, main, and footer placeholders', () => {
    render(<PageChromeSkeleton />);

    expect(screen.getByLabelText('Loading site header')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading page content')).toBeInTheDocument();
    expect(document.querySelector('footer')).toBeInTheDocument();
  });

  it('accepts a custom main region', () => {
    render(<PageChromeSkeleton main={<div>Custom main</div>} />);

    expect(screen.getByText('Custom main')).toBeInTheDocument();
  });

  it('omits the footer placeholder when showFooter is false', () => {
    render(<PageChromeSkeleton showFooter={false} />);

    expect(screen.getByLabelText('Loading site header')).toBeInTheDocument();
    expect(document.querySelector('footer')).not.toBeInTheDocument();
  });
});

describe('HeaderSkeleton', () => {
  it('exposes a busy header landmark', () => {
    render(<HeaderSkeleton />);

    expect(screen.getByLabelText('Loading site header')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders as a header element', () => {
    const { container } = render(<HeaderSkeleton />);

    expect(container.querySelector('header')).toBeTruthy();
  });
});

describe('FooterSkeleton', () => {
  it('renders a decorative footer', () => {
    const { container } = render(<FooterSkeleton />);

    expect(container.querySelector('footer')).toHaveAttribute('aria-hidden', 'true');
  });

  it('stays non-interactive', () => {
    render(<FooterSkeleton />);

    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});

describe('MainContentSkeleton', () => {
  it('uses the default busy label', () => {
    render(<MainContentSkeleton />);

    expect(screen.getByLabelText('Loading page content')).toBeInTheDocument();
  });

  it('accepts a custom aria label', () => {
    render(<MainContentSkeleton ariaLabel="Loading product" />);

    expect(screen.getByLabelText('Loading product')).toBeInTheDocument();
  });
});
