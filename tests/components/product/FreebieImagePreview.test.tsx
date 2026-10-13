import { fireEvent, render, screen } from '@testing-library/react';

import { FreebieImagePreview } from '@/components/product/FreebieImagePreview';
import { productMessages } from '@/config/product/product.config';

describe('FreebieImagePreview', () => {
  it('renders enlarged image when open', () => {
    render(
      <FreebieImagePreview
        open
        src="https://cdn.example.com/freebie.png"
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByTestId('freebie-image-preview')).toHaveAttribute(
      'src',
      'https://cdn.example.com/freebie.png',
    );
    expect(
      screen.getByRole('dialog', { name: productMessages.a11y.enlargeFreebieImage }),
    ).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <FreebieImagePreview
        open={false}
        src="https://cdn.example.com/freebie.png"
        onClose={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('freebie-image-preview')).not.toBeInTheDocument();
  });

  it('calls onClose from the close control', () => {
    const onClose = jest.fn();
    render(
      <FreebieImagePreview open src="https://cdn.example.com/freebie.png" onClose={onClose} />,
    );

    fireEvent.click(screen.getByRole('button', { name: productMessages.a11y.closeFreebieImage }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose from the backdrop', () => {
    const onClose = jest.fn();
    render(
      <FreebieImagePreview open src="https://cdn.example.com/freebie.png" onClose={onClose} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });
});
