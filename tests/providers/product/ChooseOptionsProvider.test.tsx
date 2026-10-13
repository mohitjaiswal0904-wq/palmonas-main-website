import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import {
  ChooseOptionsProvider,
  useChooseOptions,
} from '@/providers/product/ChooseOptionsProvider';
import type { Product } from '@/types/product';

const product: Product = {
  id: 'prod-1',
  handle: 'test-ring',
  name: 'Test Ring',
  description: '',
  price: 1000,
  image: 'https://cdn.example.com/img.jpg',
  images: ['https://cdn.example.com/img.jpg'],
  category: 'rings',
  productCategory: 'demifine',
  offers: [],
  variants: [
    {
      id: 'variant-1',
      title: 'Gold',
      price: 1000,
      availableForSale: true,
      selectedOptions: [{ name: 'Metal', value: 'Gold' }],
    },
  ],
};

function Probe() {
  const { isOpen, params, openChooseOptions, closeChooseOptions } = useChooseOptions();

  return (
    <div>
      <button
        type="button"
        onClick={() => openChooseOptions({ product, intent: 'addToCart' })}
      >
        Open sheet
      </button>
      <button type="button" onClick={closeChooseOptions}>
        Close sheet
      </button>
      <span data-testid="open">{String(isOpen)}</span>
      <span data-testid="product">{params?.product.id ?? ''}</span>
      <span data-testid="intent">{params?.intent ?? ''}</span>
    </div>
  );
}

function renderWithProvider(ui: ReactNode) {
  return render(<ChooseOptionsProvider>{ui}</ChooseOptionsProvider>);
}

describe('ChooseOptionsProvider', () => {
  it('opens the sheet with product and intent', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Probe />);

    await user.click(screen.getByRole('button', { name: 'Open sheet' }));

    expect(screen.getByTestId('open')).toHaveTextContent('true');
    expect(screen.getByTestId('product')).toHaveTextContent('prod-1');
    expect(screen.getByTestId('intent')).toHaveTextContent('addToCart');
  });

  it('closes the sheet and clears params', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Probe />);

    await user.click(screen.getByRole('button', { name: 'Open sheet' }));
    await user.click(screen.getByRole('button', { name: 'Close sheet' }));

    expect(screen.getByTestId('open')).toHaveTextContent('false');
    expect(screen.getByTestId('product')).toHaveTextContent('');
  });

  it('is a no-op outside the provider', () => {
    render(<Probe />);

    expect(screen.getByTestId('open')).toHaveTextContent('false');

    act(() => {
      screen.getByRole('button', { name: 'Open sheet' }).click();
    });

    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('replaces params when opened again with buyNow intent', async () => {
    const user = userEvent.setup();

    function BuyNowProbe() {
      const { openChooseOptions, params } = useChooseOptions();

      return (
        <div>
          <button
            type="button"
            onClick={() => openChooseOptions({ product, intent: 'buyNow' })}
          >
            Open buy now
          </button>
          <span data-testid="intent">{params?.intent ?? ''}</span>
        </div>
      );
    }

    renderWithProvider(<BuyNowProbe />);
    await user.click(screen.getByRole('button', { name: 'Open buy now' }));
    expect(screen.getByTestId('intent')).toHaveTextContent('buyNow');
  });
});
