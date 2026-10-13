import { render, screen } from '@testing-library/react';

import {
  LIMITED_OFFER_RIBBON_GEOMETRY,
  LimitedOfferRibbon,
} from '@/components/product/gold/LimitedOfferRibbon';
import { productMessages } from '@/config/product/product.config';

describe('LimitedOfferRibbon', () => {
  it('renders limited-time offer label inside svg', () => {
    render(<LimitedOfferRibbon />);

    expect(screen.getAllByText(productMessages.limitedTimeOffer).length).toBeGreaterThanOrEqual(1);
  });

  it('left-aligns ribbon svg to parent (fold tip on content column)', () => {
    const { container } = render(<LimitedOfferRibbon />);
    const wraps = container.querySelectorAll(':scope > div');
    const svgs = container.querySelectorAll('svg');

    expect(svgs.length).toBe(2);
    expect(svgs[0]).toHaveAttribute(
      'viewBox',
      `0 0 ${LIMITED_OFFER_RIBBON_GEOMETRY.mobile.viewWidth} ${LIMITED_OFFER_RIBBON_GEOMETRY.mobile.viewHeight}`,
    );
    expect(svgs[1]).toHaveAttribute(
      'viewBox',
      `0 0 ${LIMITED_OFFER_RIBBON_GEOMETRY.desktop.viewWidth} ${LIMITED_OFFER_RIBBON_GEOMETRY.desktop.viewHeight}`,
    );
    expect(wraps[0]).toHaveClass('left-0', 'top-0');
    expect(wraps[1]).toHaveClass('left-0', 'top-0');
    expect(LIMITED_OFFER_RIBBON_GEOMETRY.mobile.foldX).toBeCloseTo(7.65);
    expect(LIMITED_OFFER_RIBBON_GEOMETRY.desktop.foldX).toBeCloseTo(11.05);
    expect(LIMITED_OFFER_RIBBON_GEOMETRY.mobile.width).toBeLessThan(
      LIMITED_OFFER_RIBBON_GEOMETRY.mobile.viewWidth,
    );
  });
});
