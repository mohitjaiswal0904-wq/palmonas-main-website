import { render, screen } from '@testing-library/react';

import { ProductColorSwatches } from '@/components/product/ProductColorSwatches';
import type { Product } from '@/types/product';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...rest }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} {...rest} />
  ),
}));

function makeProduct(colors?: string[]): Product {
  return {
    id: 'prod-1',
    handle: 'demo-ring',
    name: 'Demo Ring',
    description: '',
    price: 1000,
    image: 'https://cdn.example.com/img.jpg',
    images: ['https://cdn.example.com/img.jpg'],
    category: 'rings',
    productCategory: 'demifine',
    offers: [],
    variants: [],
    colors,
  };
}

describe('ProductColorSwatches', () => {
  it('renders available colors when two chip colors exist', () => {
    render(<ProductColorSwatches product={makeProduct(['gold', 'silver'])} />);

    expect(screen.getByLabelText(/^Available colors:/)).toBeInTheDocument();
  });

  it('renders available colors when three chip colors exist', () => {
    render(
      <ProductColorSwatches product={makeProduct(['gold', 'rose gold', 'silver'])} />,
    );

    expect(screen.getByLabelText(/^Available colors:/)).toBeInTheDocument();
  });

  it('renders nothing when the product has no colors', () => {
    const { container } = render(<ProductColorSwatches product={makeProduct([])} />);

    expect(screen.queryByLabelText(/^Available colors:/)).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the product has a single chip color', () => {
    const { container } = render(<ProductColorSwatches product={makeProduct(['gold'])} />);

    expect(screen.queryByLabelText(/^Available colors:/)).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
