import { fireEvent, render, screen } from '@testing-library/react';

import { AddressForm } from '@/components/cart/sheets/AddressForm';
import { cartMessages } from '@/config/cart/cart.config';

describe('AddressForm', () => {
  it('does not save when required fields are missing', () => {
    const onSave = jest.fn();
    render(<AddressForm onSave={onSave} />);

    fireEvent.click(screen.getByTestId('address-save-button'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves with trimmed defaults for optional fields', () => {
    const onSave = jest.fn();
    render(<AddressForm onSave={onSave} />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1]!, { target: { value: ' 12 Palm Grove ' } });
    fireEvent.change(inputs[3]!, { target: { value: '560095' } });
    fireEvent.change(inputs[4]!, { target: { value: '+919999999999' } });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByTestId('address-save-button'));

    expect(onSave).toHaveBeenCalledWith({
      fullName: 'Name',
      line1: '12 Palm Grove',
      line2: undefined,
      city: 'City',
      zip: '560095',
      phone: '+919999999999',
      country: 'India',
      isDefault: true,
    });
    expect(screen.getByText(cartMessages.fullName)).toBeInTheDocument();
  });
});
