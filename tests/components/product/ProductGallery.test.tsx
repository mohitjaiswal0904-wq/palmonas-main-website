import { render, screen } from '@testing-library/react';

import { ProductGallery } from '@/components/product/ProductGallery';
import type { Product } from '@/types/product';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} />
  ),
}));

function emptyProduct(): Product {
  return {
    id: 'p1',
    handle: 'empty',
    name: 'Empty Product',
    description: '',
    price: 0,
    image: '',
    images: [],
    category: '',
    productCategory: 'demifine',
    offers: [],
    variants: [],
  };
}

function productWithImages(): Product {
  return {
    ...emptyProduct(),
    name: 'Halo Necklace',
    images: ['https://cdn.example.com/1.jpg', 'https://cdn.example.com/2.jpg'],
  };
}

describe('ProductGallery', () => {
  it('uses square aspect on empty placeholder (PW-619)', () => {
    const { container } = render(<ProductGallery product={emptyProduct()} />);
    const section = screen.getByLabelText('Empty Product gallery');
    const placeholder = section.querySelector('.aspect-square, [class*="aspect-"]');

    expect(placeholder?.className).toContain('aspect-square');
    expect(placeholder?.className).not.toContain('aspect-[4/5]');
    expect(container.querySelector('[class*="aspect-[4/5]"]')).toBeNull();
  });

  it('caps the laptop media column to the info column and scrolls the overflow (PW-643)', () => {
    render(<ProductGallery product={productWithImages()} />);
    const section = screen.getByLabelText('Halo Necklace gallery');

    expect(section.className).toContain('laptop:absolute');
    expect(section.className).toContain('laptop:inset-0');
    expect(section.className).toContain('laptop:overflow-y-auto');
    expect(section.className).toContain('scrollbar-hide');
  });

  it('keeps the placeholder in flow so an image-less PDP has no absolute media box', () => {
    render(<ProductGallery product={emptyProduct()} />);

    expect(screen.getByLabelText('Empty Product gallery').className).not.toContain(
      'laptop:absolute',
    );
  });
});
