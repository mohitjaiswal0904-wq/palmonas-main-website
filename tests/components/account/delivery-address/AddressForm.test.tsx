import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AddressFormFields } from '@/components/account/delivery-address/AddressForm';
import { addressMessages } from '@/config/address/address.config';
import { pincodeMessages } from '@/config/pincode/pincode.config';

import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const mockPush = jest.fn();
const toastMock = createUseToastMock();
const mockCreateAddress = jest.fn();
const mockUpdateAddress = jest.fn();
const mockSetDefaultAddress = jest.fn();
const mockValidatePincode = jest.fn();

jest.mock('@/hooks/usePincode', () => ({
  usePincode: () => ({
    validatePincode: mockValidatePincode,
    isValidating: false,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

jest.mock('@/hooks/user', () => ({
  useCreateUserAddress: () => ({
    createAddress: mockCreateAddress,
    isPending: false,
  }),
  useUpdateUserAddress: () => ({
    updateAddress: mockUpdateAddress,
    isPending: false,
  }),
  useSetDefaultAddress: () => ({
    setDefaultAddress: mockSetDefaultAddress,
    isPending: false,
  }),
  useUserAddress: () => ({
    address: undefined,
    isLoading: false,
    error: null,
  }),
}));

function renderCreateForm() {
  return render(
    <AddressFormFields
      mode="create"
      initialForm={{
        firstName: '',
        lastName: '',
        addressLine1: '',
        addressLine2: '',
        company: '',
        zip: '',
        phone: '',
        city: '',
        province: '',
        country: 'India',
        isDefault: false,
      }}
    />,
  );
}

describe('AddressFormFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidatePincode.mockResolvedValue({
      valid: true,
      pincode: '400001',
      message: 'ok',
      postOffices: [],
    });
  });

  it('shows validation errors and blocks save when mandatory fields are blank', async () => {
    const user = userEvent.setup();
    renderCreateForm();

    await user.click(screen.getByRole('button', { name: 'Save address' }));

    expect(await screen.findByText(addressMessages.validation.firstNameRequired)).toBeInTheDocument();
    expect(screen.getByText(addressMessages.validation.pincodeInvalid)).toBeInTheDocument();
    expect(screen.getByText(addressMessages.validation.phoneInvalid)).toBeInTheDocument();
    expect(mockCreateAddress).not.toHaveBeenCalled();
  });

  it('renders the state field for India addresses', () => {
    renderCreateForm();

    expect(screen.getByLabelText(addressMessages.labels.state)).toBeInTheDocument();
  });

  it('strips alphabetic characters from pincode and phone inputs', async () => {
    const user = userEvent.setup();
    renderCreateForm();

    await user.type(screen.getByLabelText('Postal or zip code'), '12ab34');
    await user.type(screen.getByLabelText('Phone number'), '98abc76543');

    expect(screen.getByLabelText('Postal or zip code')).toHaveValue('1234');
    expect(screen.getByLabelText('Phone number')).toHaveValue('9876543');
  });

  it('creates address when form is valid', async () => {
    const user = userEvent.setup();
    mockCreateAddress.mockResolvedValue({ id: 'addr-1', isDefault: false });
    renderCreateForm();

    await user.type(screen.getByLabelText('First name'), 'Jane');
    await user.type(screen.getByLabelText('Last name'), 'Doe');
    await user.type(screen.getByLabelText('Address line 1'), '12 Main Street');
    await user.type(screen.getByLabelText('Postal or zip code'), '400001');
    await user.type(screen.getByLabelText('Phone number'), '9876543210');
    await user.type(screen.getByLabelText('City'), 'Mumbai');
    await user.selectOptions(screen.getByLabelText(addressMessages.labels.state), 'Maharashtra');
    await user.click(screen.getByRole('button', { name: 'Save address' }));

    await waitFor(() => {
      expect(mockValidatePincode).toHaveBeenCalledWith('400001');
      expect(mockCreateAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Doe',
          province: 'Maharashtra',
          zip: '400001',
          phone: '9876543210',
        }),
      );
    });
  });

  it('blocks save when India Post pincode lookup fails', async () => {
    const user = userEvent.setup();
    mockValidatePincode.mockResolvedValue({
      valid: false,
      pincode: '999999',
      message: 'Invalid pincode',
      postOffices: [],
    });
    renderCreateForm();

    await user.type(screen.getByLabelText('First name'), 'Jane');
    await user.type(screen.getByLabelText('Last name'), 'Doe');
    await user.type(screen.getByLabelText('Address line 1'), '12 Main Street');
    await user.type(screen.getByLabelText('Postal or zip code'), '999999');
    await user.type(screen.getByLabelText('Phone number'), '9876543210');
    await user.type(screen.getByLabelText('City'), 'Mumbai');
    await user.selectOptions(screen.getByLabelText(addressMessages.labels.state), 'Maharashtra');
    await user.click(screen.getByRole('button', { name: 'Save address' }));

    expect(await screen.findByText(pincodeMessages.invalidPincode)).toBeInTheDocument();
    expect(mockCreateAddress).not.toHaveBeenCalled();
  });
});
