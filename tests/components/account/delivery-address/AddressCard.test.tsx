import { render, screen } from '@testing-library/react';

import { AddressCard } from '@/components/account/delivery-address/AddressCard';
import { addressMessages } from '@/config/address/address.config';
import type { UserAddress } from '@/types/user';

const mockAddress: UserAddress = {
  id: 'addr-1',
  firstName: 'Jane',
  lastName: 'Doe',
  fullName: 'Jane Doe',
  company: null,
  addressLine1: '12 MG Road',
  addressLine2: null,
  city: 'Pune',
  zip: '411001',
  country: 'India',
  province: 'Maharashtra',
  phone: '9876543210',
  isDefault: true,
};

describe('AddressCard', () => {
  it('renders address details and edit link', () => {
    render(<AddressCard address={mockAddress} />);

    expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: addressMessages.a11y.editAddress.replace('{name}', 'Jane Doe'),
      }),
    ).toHaveAttribute('href', '/account/delivery-address/addr-1/edit');
  });
});
