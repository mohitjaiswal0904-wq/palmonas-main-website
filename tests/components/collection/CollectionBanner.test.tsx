import { render, screen } from '@testing-library/react';

import { CollectionBanner } from '@/components/collection/CollectionBanner';
import type { Collection } from '@/types/collection';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...rest }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} {...rest} />
  ),
}));

function makeCollection(image?: string): Collection {
  return {
    id: 'col-1',
    handle: 'earrings',
    title: 'Earrings',
    image,
  };
}

describe('CollectionBanner', () => {
  it('renders the banner image when a URL is present', () => {
    const { container } = render(
      <CollectionBanner collection={makeCollection('https://cdn.example/banner.jpg')} />,
    );

    expect(screen.getByAltText('Earrings')).toBeInTheDocument();
    expect(container.querySelector('.aspect-\\[3\\/1\\]')).toBeInTheDocument();
  });

  it('renders nothing when the image is missing', () => {
    const { container } = render(<CollectionBanner collection={makeCollection()} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="aspect-"]')).not.toBeInTheDocument();
  });

  it('renders nothing when the image is whitespace', () => {
    const { container } = render(<CollectionBanner collection={makeCollection('   ')} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="aspect-"]')).not.toBeInTheDocument();
  });

  it('renders nothing when the image is an empty string', () => {
    const { container } = render(<CollectionBanner collection={makeCollection('')} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="aspect-"]')).not.toBeInTheDocument();
  });
});
