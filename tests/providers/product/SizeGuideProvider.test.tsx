import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { SizeGuideProvider, useSizeGuide } from '@/providers/product/SizeGuideProvider';

function Probe() {
  const { isOpen, params, openSizeGuide, closeSizeGuide } = useSizeGuide();

  return (
    <div>
      <button type="button" onClick={() => openSizeGuide({ kind: 'ring' })}>
        Open ring guide
      </button>
      <button type="button" onClick={() => openSizeGuide({ kind: 'diamond' })}>
        Open diamond guide
      </button>
      <button type="button" onClick={closeSizeGuide}>
        Close guide
      </button>
      <span data-testid="open">{String(isOpen)}</span>
      <span data-testid="kind">{params?.kind ?? ''}</span>
    </div>
  );
}

function renderWithProvider(ui: ReactNode) {
  return render(<SizeGuideProvider>{ui}</SizeGuideProvider>);
}

describe('SizeGuideProvider', () => {
  it('opens the ring size guide', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Probe />);

    await user.click(screen.getByRole('button', { name: 'Open ring guide' }));

    expect(screen.getByTestId('open')).toHaveTextContent('true');
    expect(screen.getByTestId('kind')).toHaveTextContent('ring');
  });

  it('opens the diamond guide', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Probe />);

    await user.click(screen.getByRole('button', { name: 'Open diamond guide' }));

    expect(screen.getByTestId('kind')).toHaveTextContent('diamond');
  });

  it('closes the guide and clears params', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Probe />);

    await user.click(screen.getByRole('button', { name: 'Open ring guide' }));
    await user.click(screen.getByRole('button', { name: 'Close guide' }));

    expect(screen.getByTestId('open')).toHaveTextContent('false');
    expect(screen.getByTestId('kind')).toHaveTextContent('');
  });

  it('is a no-op outside the provider', () => {
    render(<Probe />);

    act(() => {
      screen.getByRole('button', { name: 'Open ring guide' }).click();
    });

    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });
});
