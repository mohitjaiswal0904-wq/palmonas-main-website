import { render, screen } from '@testing-library/react';

import { DemifineCashbackBanner } from '@/components/product/DemifineCashbackBanner';
import { demifinePreDealsConfig, productTheme } from '@/config/product/product.config';

describe('DemifineCashbackBanner', () => {
  it('shows the configured free gift product and free price', () => {
    render(<DemifineCashbackBanner />);

    expect(screen.getByText(demifinePreDealsConfig.freeGift.name)).toBeInTheDocument();
    expect(screen.getByText('₹1,495')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText(/on orders above ₹2,599/)).toBeInTheDocument();
    expect(screen.getByText('Free gift')).toHaveClass('free-gift-badge-shake');
  });

  it('links to the free gift PDP', () => {
    render(<DemifineCashbackBanner />);

    expect(screen.getByTestId('pdp-free-gift-banner')).toHaveAttribute(
      'href',
      `/products/${demifinePreDealsConfig.freeGift.handle}`,
    );
  });

  it('does not render wallet cashback copy', () => {
    render(<DemifineCashbackBanner />);

    expect(screen.queryByText(/cashback in your wallet/)).not.toBeInTheDocument();
  });

  it('uses the mint banner token and product image', () => {
    render(<DemifineCashbackBanner />);
    const banner = screen.getByTestId('pdp-free-gift-banner');

    expect(banner).toHaveStyle({
      backgroundImage: productTheme.freeGiftBanner.gradient,
    });
    expect(banner.querySelector('img')).toHaveAttribute(
      'src',
      demifinePreDealsConfig.freeGift.imageUrl,
    );
  });
});
