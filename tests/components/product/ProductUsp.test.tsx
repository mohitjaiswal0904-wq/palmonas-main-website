import { render, screen } from '@testing-library/react';

import { ProductUsp } from '@/components/product/ProductUsp';
import { goldUspImage, productMessages } from '@/config/product/product.config';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

describe('ProductUsp', () => {
  it('renders gold trust art for gold products', () => {
    render(<ProductUsp productCategory="gold" usps={['anti_tarnish']} />);

    expect(screen.getByRole('img', { name: productMessages.a11y.goldTrustBadges })).toHaveAttribute(
      'src',
      goldUspImage.src,
    );
    expect(screen.queryByText(productMessages.usps.anti_tarnish)).not.toBeInTheDocument();
  });

  it('renders demifine badge images from API usps', () => {
    render(
      <ProductUsp
        productCategory="demifine"
        usps={['anti_tarnish', 'skin_safe_jewellery', 'sterling_silver_925']}
      />,
    );

    expect(screen.getByRole('img', { name: productMessages.usps.sterling_silver_925 })).toBeInTheDocument();
  });

  it('hides demifine USPs when the API list is empty', () => {
    const { container } = render(<ProductUsp productCategory="demifine" usps={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('hides demifine USPs when usps is omitted', () => {
    const { container } = render(<ProductUsp productCategory="platinum" />);

    expect(container).toBeEmptyDOMElement();
  });
});
