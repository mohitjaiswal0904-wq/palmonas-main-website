import { fireEvent, render, screen } from '@testing-library/react';

import { AddressList } from '@/components/cart/sheets/AddressList';
import { cartConfig } from '@/config/cart/cart.config';

const addresses = cartConfig.mock.addresses;

describe('AddressList', () => {
  it('renders address cards and marks selected address', () => {
    const onSelect = jest.fn();

    render(
      <AddressList
        addresses={addresses}
        selectedId={addresses[0]?.id}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByTestId('address-list')).toBeInTheDocument();
    expect(screen.getByTestId('address-card-selected')).toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId('address-card')[0]!);
    expect(onSelect).toHaveBeenCalled();
  });

  it('renders optional line2 and phone on address cards', () => {
    render(
      <AddressList
        addresses={[
          {
            id: 'a1',
            fullName: 'Test User',
            line1: 'Line 1',
            line2: 'Line 2',
            city: 'Bengaluru',
            zip: '560001',
            phone: '+919999999999',
            country: 'India',
          },
        ]}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('Line 2')).toBeInTheDocument();
    expect(screen.getByText('+919999999999')).toBeInTheDocument();
  });

  it('omits line2 when not provided and renders unselected cards', () => {
    render(
      <AddressList
        addresses={[
          {
            id: 'a2',
            fullName: 'No Line2',
            line1: 'Line 1 only',
            city: 'Mumbai',
            zip: '400001',
            phone: '9876543210',
            country: 'India',
          },
        ]}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByTestId('address-card')).toBeInTheDocument();
    expect(screen.queryByTestId('address-card-selected')).not.toBeInTheDocument();
    expect(screen.queryByText('Line 2')).not.toBeInTheDocument();
  });
});
