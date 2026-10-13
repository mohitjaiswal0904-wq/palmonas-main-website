import { fireEvent, render, screen } from '@testing-library/react';

import { CarouselDots } from '@/components/product/CarouselDots';

describe('CarouselDots', () => {
  it('renders one control per slide when count is 2+', () => {
    render(<CarouselDots count={3} activeIndex={0} onSelect={jest.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('marks the active slide for assistive tech', () => {
    render(<CarouselDots count={3} activeIndex={1} onSelect={jest.fn()} />);

    expect(screen.getByRole('button', { current: true })).toHaveAttribute(
      'aria-label',
      'View item 2 of 3',
    );
  });

  it('returns null when there is nothing to paginate', () => {
    const { container } = render(
      <CarouselDots count={1} activeIndex={0} onSelect={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('calls onSelect with the tapped index', () => {
    const onSelect = jest.fn();
    render(<CarouselDots count={3} activeIndex={0} onSelect={onSelect} />);

    fireEvent.click(screen.getByLabelText('View item 3 of 3'));

    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
