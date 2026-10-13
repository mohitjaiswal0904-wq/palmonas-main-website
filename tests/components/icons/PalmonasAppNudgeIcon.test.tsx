import { render } from '@testing-library/react';

import { PalmonasAppNudgeIcon } from '@/components/icons/PalmonasAppNudgeIcon';

describe('PalmonasAppNudgeIcon', () => {
  it('renders the Palmonas app mark SVG', () => {
    const { container } = render(<PalmonasAppNudgeIcon />);

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('svg path')).toHaveAttribute('fill', 'white');
  });

  it('uses a black circular background wrapper', () => {
    const { container } = render(<PalmonasAppNudgeIcon />);

    expect(container.firstChild).toHaveClass('rounded-full', 'bg-black');
  });
});
