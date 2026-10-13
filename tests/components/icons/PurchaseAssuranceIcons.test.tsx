import { render } from '@testing-library/react';

import {
  PurchaseCodIcon,
  PurchaseExchangeIcon,
  PurchaseReturnIcon,
} from '@/components/icons/PurchaseAssuranceIcons';
import { purchaseAssuranceIcons } from '@/config/product/product.config';
import { productTokens } from '@/config/theme/product.tokens';

describe('PurchaseAssuranceIcons', () => {
  it('renders the return mark as a decorative CDN image', () => {
    const { container } = render(<PurchaseReturnIcon className="size-7" />);
    const image = container.querySelector('img');

    expect(image).toHaveAttribute('aria-hidden', 'true');
    expect(image).toHaveAttribute('src', purchaseAssuranceIcons.twoDaysReturn.src);
    expect(image).toHaveClass('size-7');
  });

  it('renders the exchange mark as a decorative CDN image', () => {
    const { container } = render(<PurchaseExchangeIcon className="size-7" />);
    const image = container.querySelector('img');

    expect(image).toHaveAttribute('aria-hidden', 'true');
    expect(image).toHaveAttribute('src', purchaseAssuranceIcons.tenDaysExchange.src);
    expect(image).toHaveClass('size-7');
  });

  it('renders the COD mark as a rupee inside a matching ring', () => {
    const { container } = render(<PurchaseCodIcon className="size-7" />);
    const ring = container.querySelector('span');
    const glyph = container.querySelector('svg');

    expect(ring).toHaveClass('size-7', 'rounded-full');
    expect(ring).toHaveStyle({
      color: productTokens.textMuted,
      borderColor: productTokens.textMuted,
    });
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
    expect(glyph).toHaveClass('size-full');
  });

  it('hides the assurance marks from the accessibility tree', () => {
    const { container } = render(
      <>
        <PurchaseReturnIcon />
        <PurchaseExchangeIcon />
        <PurchaseCodIcon />
      </>,
    );

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
  });
});
