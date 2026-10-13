import { render, screen } from '@testing-library/react';

import { DrawerImage } from '@/components/layout/drawer/DrawerImage';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    src,
    priority,
  }: {
    alt: string;
    src: string;
    priority?: boolean;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element -- test stub for next/image
    return <img alt={alt} src={src} data-priority={priority ? 'true' : 'false'} />;
  },
}));

describe('DrawerImage', () => {
  it('renders a placeholder when src is empty', () => {
    const { container } = render(<DrawerImage src="   " alt="Category" className="h-full" />);

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders an image for a valid CDN src', () => {
    render(
      <DrawerImage
        src="https://d2ppgkj0vs05g5.cloudfront.net/cms/media/tile.webp"
        alt="Rings"
      />,
    );

    expect(screen.getByRole('img', { name: 'Rings' })).toHaveAttribute(
      'src',
      'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/tile.webp',
    );
  });

  it('marks first-viewport tiles as priority', () => {
    render(
      <DrawerImage
        src="https://d2ppgkj0vs05g5.cloudfront.net/cms/media/tile.webp"
        alt="Priority tile"
        priority
      />,
    );

    expect(screen.getByRole('img', { name: 'Priority tile' })).toHaveAttribute(
      'data-priority',
      'true',
    );
  });

  it('defaults remaining tiles to lazy (non-priority)', () => {
    render(
      <DrawerImage
        src="https://d2ppgkj0vs05g5.cloudfront.net/cms/media/tile.webp"
        alt="Lazy tile"
      />,
    );

    expect(screen.getByRole('img', { name: 'Lazy tile' })).toHaveAttribute(
      'data-priority',
      'false',
    );
  });
});
