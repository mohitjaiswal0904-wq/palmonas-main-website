import { render, screen } from '@testing-library/react';

import { DemifineProductUsp } from '@/components/product/DemifineProductUsp';
import { productMessages, productTheme, productUspBadges } from '@/config/product/product.config';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, className }: { alt: string; src: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} className={className} />
  ),
}));

const platinumUsps = ['anti_tarnish', 'skin_safe_jewellery', 'platinum_plated'] as const;

describe('DemifineProductUsp', () => {
  it('renders Shopify USP badge images from the product API', () => {
    render(<DemifineProductUsp usps={platinumUsps} />);

    expect(screen.getByRole('img', { name: productMessages.usps.anti_tarnish })).toHaveAttribute(
      'src',
      productUspBadges.anti_tarnish.src,
    );
    expect(screen.getByRole('img', { name: productMessages.usps.skin_safe_jewellery })).toHaveAttribute(
      'src',
      productUspBadges.skin_safe_jewellery.src,
    );
    expect(screen.getByRole('img', { name: productMessages.usps.platinum_plated })).toHaveAttribute(
      'src',
      productUspBadges.platinum_plated.src,
    );
    expect(screen.queryByRole('img', { name: productMessages.usps.gold_tone_plated })).not.toBeInTheDocument();
  });

  it('exposes product benefits list label', () => {
    render(<DemifineProductUsp usps={platinumUsps} />);

    const list = screen.getByRole('list', { name: productMessages.a11y.productBenefits });
    expect(list).toHaveClass('justify-start', 'overflow-x-auto', 'flex-nowrap');
  });

  it('keeps every badge the same height', () => {
    render(<DemifineProductUsp usps={platinumUsps} />);

    const images = screen.getAllByRole('img');
    const slots = images.map((image) => image.parentElement);

    expect(images.length).toBe(3);
    images.forEach((image) => {
      expect(image).toHaveClass(...productTheme.uspStrip.imageClass.split(' '));
    });
    slots.forEach((slot) => {
      expect(slot).toHaveClass(...productTheme.uspStrip.itemClass.split(' '));
    });
  });

  it('renders a fourth badge for adjustable rings', () => {
    render(
      <DemifineProductUsp
        usps={['anti_tarnish', 'skin_safe_jewellery', 'gold_tone_plated', 'adjustable_rings']}
      />,
    );

    expect(screen.getByRole('img', { name: productMessages.usps.adjustable_rings })).toHaveAttribute(
      'src',
      productUspBadges.adjustable_rings.src,
    );
  });

  it('renders nothing when the API sends no usps', () => {
    const { container } = render(<DemifineProductUsp usps={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('list', { name: productMessages.a11y.productBenefits })).not.toBeInTheDocument();
  });
});
