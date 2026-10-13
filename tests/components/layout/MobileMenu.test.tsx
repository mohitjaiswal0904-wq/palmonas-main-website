import { render, screen } from '@testing-library/react';

import { MobileMenu } from '@/components/layout/MobileMenu';

describe('MobileMenu', () => {
  it('does not render an in-page category switcher', () => {
    const { container } = render(<MobileMenu />);

    expect(container).toBeEmptyDOMElement();
  });
});
