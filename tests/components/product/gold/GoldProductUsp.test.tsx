import { render, screen } from '@testing-library/react';

import { GoldProductUsp } from '@/components/product/gold/GoldProductUsp';
import { goldUspImage, productMessages } from '@/config/product/product.config';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, sizes }: { alt: string; src: string; sizes?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} data-sizes={sizes} />
  ),
}));

describe('GoldProductUsp', () => {
  it('renders the single CMS trust strip', () => {
    render(<GoldProductUsp />);

    expect(screen.getByAltText(productMessages.a11y.goldTrustBadges)).toHaveAttribute(
      'src',
      goldUspImage.src,
    );
  });

  it('keeps the product benefits region label', () => {
    render(<GoldProductUsp />);

    expect(
      screen.getByRole('region', { name: productMessages.a11y.productBenefits }),
    ).toBeInTheDocument();
  });

  it('announces all four badge names through the strip alt text', () => {
    render(<GoldProductUsp />);
    const alt = screen.getByRole('img').getAttribute('alt') ?? '';

    for (const badge of ['BIS Hallmark', 'SGL/IGI Certified', 'Lifetime Buyback', 'Return']) {
      expect(alt).toContain(badge);
    }
  });

  it('no longer renders the four separate badge cards', () => {
    render(<GoldProductUsp />);

    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.queryByLabelText('BIS Hallmark')).not.toBeInTheDocument();
  });
});
