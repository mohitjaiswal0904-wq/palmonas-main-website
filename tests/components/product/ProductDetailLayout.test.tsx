import { render } from '@testing-library/react';

import { ProductDetailLayout } from '@/components/product/ProductDetailLayout';

describe('ProductDetailLayout', () => {
  it('does not sticky-pin gallery or info on laptop', () => {
    const { container } = render(
      <ProductDetailLayout gallery={<div>gallery</div>} info={<div>info</div>} />,
    );

    const columns = container.querySelectorAll('main > div');
    expect(columns).toHaveLength(2);
    expect(columns[0]?.className).not.toContain('laptop:sticky');
    expect(columns[1]?.className).not.toContain('laptop:sticky');
  });

  it('keeps the two-column laptop grid shell', () => {
    const { container } = render(
      <ProductDetailLayout gallery={<div>gallery</div>} info={<div>info</div>} />,
    );

    expect(container.querySelector('main')?.className).toContain('laptop:grid-cols-[7fr_3fr]');
  });

  it('renders gallery and info slots', () => {
    const { getByText } = render(
      <ProductDetailLayout gallery={<div>gallery</div>} info={<div>info</div>} />,
    );

    expect(getByText('gallery')).toBeInTheDocument();
    expect(getByText('info')).toBeInTheDocument();
  });

  it('applies mobile info padding without sticky', () => {
    const { container } = render(
      <ProductDetailLayout gallery={<div>gallery</div>} info={<div>info</div>} />,
    );

    expect(container.querySelectorAll('main > div')[1]?.className).toContain('px-4');
    expect(container.querySelectorAll('main > div')[1]?.className).toContain('pt-6');
  });

  it('nudges laptop info column min-width to Figma panel (~416px)', () => {
    const { container } = render(
      <ProductDetailLayout gallery={<div>gallery</div>} info={<div>info</div>} />,
    );

    expect(container.querySelectorAll('main > div')[1]?.className).toContain(
      'laptop:min-w-[416px]',
    );
  });

  it('lets the info column size the laptop row while the gallery cell hosts the scroll box (PW-643)', () => {
    const { container } = render(
      <ProductDetailLayout gallery={<div>gallery</div>} info={<div>info</div>} />,
    );
    const main = container.querySelector('main');
    const columns = container.querySelectorAll('main > div');

    expect(main?.className).not.toContain('laptop:items-start');
    expect(columns[0]?.className).toContain('laptop:relative');
    expect(columns[1]?.className).toContain('laptop:self-start');
  });

  it('uses symmetric laptop page inset and Figma column gap', () => {
    const { container } = render(
      <ProductDetailLayout gallery={<div>gallery</div>} info={<div>info</div>} />,
    );
    const main = container.querySelector('main');

    expect(main?.className).toContain('laptop:px-8');
    expect(main?.className).toContain('laptop:gap-10');
  });
});
