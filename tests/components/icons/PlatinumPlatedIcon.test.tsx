import { render } from '@testing-library/react';

import { PlatinumPlatedIcon } from '@/components/icons/PlatinumPlatedIcon';

describe('PlatinumPlatedIcon', () => {
  it('renders the inline Figma platinum seal', () => {
    const { container } = render(<PlatinumPlatedIcon />);

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 13 13');
  });

  it('sets explicit 13×13 dimensions', () => {
    const { container } = render(<PlatinumPlatedIcon className="h-3 w-[13px]" />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('width', '13');
    expect(icon).toHaveAttribute('height', '13');
    expect(container.firstElementChild).toHaveClass('h-3', 'w-[13px]', 'overflow-hidden');
  });

  it('is hidden from the accessibility tree', () => {
    const { container } = render(<PlatinumPlatedIcon />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('clips the seal to the 13px box', () => {
    const { container } = render(<PlatinumPlatedIcon />);

    expect(container.firstElementChild).toHaveClass('overflow-hidden');
  });
});
