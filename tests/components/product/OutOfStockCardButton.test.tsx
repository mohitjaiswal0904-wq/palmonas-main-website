import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OutOfStockCardButton } from '@/components/product/OutOfStockCardButton';
import { wishlistMessages } from '@/config/wishlist';

const mockShowWarning = jest.fn();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showWarning: mockShowWarning,
  }),
}));

describe('OutOfStockCardButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders an accessible disabled-style plus control', () => {
    render(<OutOfStockCardButton />);

    const button = screen.getByRole('button', { name: wishlistMessages.a11y.outOfStock });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('cursor-not-allowed', 'size-[22px]');
    expect(button.className).not.toContain('w-[12%]');
  });

  it('toasts the shared out-of-stock message on click', async () => {
    const user = userEvent.setup();
    render(<OutOfStockCardButton />);

    await user.click(screen.getByRole('button', { name: wishlistMessages.a11y.outOfStock }));

    expect(mockShowWarning).toHaveBeenCalledWith(wishlistMessages.toasts.outOfStock);
  });

  it('stops click propagation so parent card links are not activated', async () => {
    const user = userEvent.setup();
    const onParentClick = jest.fn();

    render(
      <div onClick={onParentClick}>
        <OutOfStockCardButton />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: wishlistMessages.a11y.outOfStock }));

    expect(onParentClick).not.toHaveBeenCalled();
    expect(mockShowWarning).toHaveBeenCalledTimes(1);
  });

  it('does not toast before the control is pressed', () => {
    render(<OutOfStockCardButton />);

    expect(screen.getByRole('button', { name: wishlistMessages.a11y.outOfStock })).toBeInTheDocument();
    expect(mockShowWarning).not.toHaveBeenCalled();
  });
});
