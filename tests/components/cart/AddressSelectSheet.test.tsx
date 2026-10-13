import { fireEvent, render, screen } from '@testing-library/react';

import { AddressSelectSheet } from '@/components/cart/sheets/AddressSelectSheet';
import { cartConfig, cartMessages } from '@/config/cart/cart.config';

const mockUseMediaQuery = jest.fn();

jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: (breakpoint: string) => mockUseMediaQuery(breakpoint),
}));

const addresses = cartConfig.mock.addresses;

describe('AddressSelectSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bottom sheet only on mobile when open', () => {
    mockUseMediaQuery.mockReturnValue(false);

    render(
      <AddressSelectSheet
        open
        onClose={jest.fn()}
        addresses={addresses}
        selectedId={addresses[0]?.id}
        onSelect={jest.fn()}
        onAddAddress={jest.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(cartMessages.selectAddress)).toBeInTheDocument();
    expect(screen.getByTestId('address-add-new-button')).toBeInTheDocument();
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  });

  it('renders centered modal only on laptop when open', () => {
    mockUseMediaQuery.mockReturnValue(true);

    render(
      <AddressSelectSheet
        open
        onClose={jest.fn()}
        addresses={addresses}
        selectedId={addresses[0]?.id}
        onSelect={jest.fn()}
        onAddAddress={jest.fn()}
      />,
    );

    expect(screen.getByText(cartMessages.selectAddress)).toBeInTheDocument();
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  });

  it('renders nothing when closed', () => {
    mockUseMediaQuery.mockReturnValue(false);

    render(
      <AddressSelectSheet
        open={false}
        onClose={jest.fn()}
        addresses={addresses}
        onSelect={jest.fn()}
        onAddAddress={jest.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('switches to add-address form and saves new address', () => {
    mockUseMediaQuery.mockReturnValue(false);
    const onAddAddress = jest.fn();

    render(
      <AddressSelectSheet
        open
        onClose={jest.fn()}
        addresses={addresses}
        onSelect={jest.fn()}
        onAddAddress={onAddAddress}
      />,
    );

    fireEvent.click(screen.getByTestId('address-add-new-button'));
    expect(screen.getByTestId('address-form')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1]!, { target: { value: '12 Palm Grove' } });
    fireEvent.change(inputs[3]!, { target: { value: '560095' } });
    fireEvent.change(inputs[4]!, { target: { value: '+919999999999' } });

    fireEvent.click(screen.getByTestId('address-save-button'));

    expect(onAddAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        line1: '12 Palm Grove',
        zip: '560095',
        phone: '+919999999999',
      }),
    );
  });

  it('selects an address and closes the sheet', () => {
    mockUseMediaQuery.mockReturnValue(false);
    const onSelect = jest.fn();
    const onClose = jest.fn();

    render(
      <AddressSelectSheet
        open
        onClose={onClose}
        addresses={addresses}
        selectedId={addresses[0]?.id}
        onSelect={onSelect}
        onAddAddress={jest.fn()}
      />,
    );

    fireEvent.click(screen.getAllByTestId('address-card')[0]!);
    expect(onSelect).toHaveBeenCalledWith(addresses[1]!.id);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes laptop modal via overlay and escape key', () => {
    mockUseMediaQuery.mockReturnValue(true);
    const onClose = jest.fn();

    render(
      <AddressSelectSheet
        open
        onClose={onClose}
        addresses={addresses}
        onSelect={jest.fn()}
        onAddAddress={jest.fn()}
      />,
    );

    fireEvent.click(screen.getAllByLabelText(cartMessages.a11y.closeSheet)[0]!);
    expect(onClose).toHaveBeenCalled();

    onClose.mockClear();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
