import { fireEvent, render, screen } from '@testing-library/react';

import { ChooseOptionsOverlay } from '@/components/product/ChooseOptionsOverlay';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';

describe('ChooseOptionsOverlay', () => {
  it('renders the Figma dialog chrome from tab up and a bottom sheet below', () => {
    render(
      <ChooseOptionsOverlay open onClose={jest.fn()} title={cartMessages.chooseOptions}>
        <p>Body</p>
      </ChooseOptionsOverlay>,
    );

    const dialog = screen.getByRole('dialog', { name: cartMessages.chooseOptions });
    expect(dialog).toHaveClass(...cartTheme.chooseOptionsOverlay.shellClass.split(' '));
    expect(dialog.className).toContain('tab:max-w-[396px]');
    expect(dialog.className).toContain('rounded-t-[20px]');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('closes from the header and the backdrop', () => {
    const onClose = jest.fn();
    render(
      <ChooseOptionsOverlay open onClose={onClose} title={cartMessages.removeVariantTitle}>
        <p>Qty</p>
      </ChooseOptionsOverlay>,
    );

    const closeButtons = screen.getAllByRole('button', { name: cartMessages.a11y.closeSheet });
    expect(closeButtons).toHaveLength(2);
    for (const button of closeButtons) {
      fireEvent.click(button);
    }
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ChooseOptionsOverlay open={false} onClose={jest.fn()} title={cartMessages.chooseOptions}>
        <p>Hidden</p>
      </ChooseOptionsOverlay>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close when Escape is pressed after the picker is already closed', () => {
    const onClose = jest.fn();
    render(
      <ChooseOptionsOverlay open={false} onClose={onClose} title={cartMessages.chooseOptions}>
        <p>Hidden</p>
      </ChooseOptionsOverlay>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
