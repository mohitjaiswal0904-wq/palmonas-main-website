import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { PopPersonalDetailsForm } from '@/components/pop/PopPersonalDetailsForm';
import { useStores } from '@/hooks/useStores';
import { AppError } from '@/lib/errors';
import { getUserDetailsForPopPrefill } from '@/services/customer.service';

jest.mock('@/services/customer.service', () => ({
  getUserDetailsForPopPrefill: jest.fn(),
}));

jest.mock('@/hooks/useStores', () => ({
  useStores: jest.fn(),
}));

const mockGetPrefill = getUserDetailsForPopPrefill as jest.MockedFunction<
  typeof getUserDetailsForPopPrefill
>;

const mockUseStores = useStores as jest.MockedFunction<typeof useStores>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const emptyPrefill = {
  name: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  pincode: '',
};

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^name/i), 'New User');
  await user.type(screen.getByLabelText(/phone number/i), '9876543210');
  await user.type(screen.getByLabelText(/^email/i), 'new@example.com');
  await user.type(screen.getByLabelText(/address line 1/i), 'Street 1');
  await user.type(screen.getByLabelText(/^city/i), 'Pune');
  await user.type(screen.getByLabelText(/pincode/i), '411001');
  await user.click(screen.getByRole('checkbox', { name: /accept terms and conditions/i }));
}

describe('PopPersonalDetailsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStores.mockReturnValue({
      stores: [
        {
          id: 1,
          name: 'Koregaon Park',
          code: 'P01',
          type: 'Retail',
          address: 'Pune',
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          pincode: '411001',
          images: [],
        },
        {
          id: 15,
          name: 'Kharghar',
          code: 'P15',
          type: 'Retail',
          address: 'Navi Mumbai',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '410210',
          images: [],
        },
      ],
      hasMoreStores: false,
      isLoading: false,
      isLoadingMoreStores: false,
      loadMoreStores: jest.fn(),
      error: null,
    });
  });

  it('shows a skeleton while loading user details', () => {
    mockGetPrefill.mockReturnValue(new Promise(() => undefined) as Promise<never>);

    render(<PopPersonalDetailsForm monthlyInstalment={1000} onSubmit={jest.fn()} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByRole('status', { name: /loading personal details/i })).toBeInTheDocument();
  });

  it('prefills fields from the first address on success', async () => {
    mockGetPrefill.mockResolvedValue({
      name: 'Pranav Arya',
      phone: '9833290022',
      email: 'pranavleo22@gmail.com',
      addressLine1: 'CHS',
      addressLine2: '',
      city: 'Navi Mumbai',
      pincode: '400614',
    });

    render(<PopPersonalDetailsForm monthlyInstalment={1000} onSubmit={jest.fn()} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/^name/i)).toHaveValue('Pranav Arya');
    });

    expect(screen.getByLabelText(/phone number/i)).toHaveValue('9833290022');
    expect(screen.getByLabelText(/^email/i)).toHaveValue('pranavleo22@gmail.com');
    expect(screen.getByLabelText(/address line 1/i)).toHaveValue('CHS');
    expect(screen.getByLabelText(/^city/i)).toHaveValue('Navi Mumbai');
    expect(screen.getByLabelText(/pincode/i)).toHaveValue('400614');
  });

  it('renders an empty editable form when the API fails', async () => {
    mockGetPrefill.mockRejectedValue(new AppError('NETWORK', 'offline'));
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<PopPersonalDetailsForm monthlyInstalment={1000} onSubmit={onSubmit} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/^name/i)).toHaveValue('');
    });

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /proceed to payment setup/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New User',
        phone: '9876543210',
        email: 'new@example.com',
        addressLine2: '',
        city: 'Pune',
        pincode: '411001',
        enrollmentMethod: 'online',
        storeId: '',
        autopay: true,
      }),
    );
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('allows editing prefilled values before submit', async () => {
    mockGetPrefill.mockResolvedValue({
      name: 'Pranav Arya',
      phone: '9833290022',
      email: 'pranavleo22@gmail.com',
      addressLine1: 'CHS',
      addressLine2: 'Old line',
      city: 'Navi Mumbai',
      pincode: '400614',
    });
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<PopPersonalDetailsForm monthlyInstalment={1000} onSubmit={onSubmit} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/^name/i)).toHaveValue('Pranav Arya');
    });

    const address2 = screen.getByLabelText(/address line 2/i);
    await user.clear(address2);
    await user.type(address2, 'Updated line');
    await user.click(screen.getByRole('checkbox', { name: /accept terms and conditions/i }));
    await user.click(screen.getByRole('button', { name: /proceed to payment setup/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pranav Arya',
        addressLine2: 'Updated line',
        enrollmentMethod: 'online',
      }),
    );
  });

  it('shows store select when At Store is chosen and requires a store', async () => {
    mockGetPrefill.mockResolvedValue(emptyPrefill);
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<PopPersonalDetailsForm monthlyInstalment={1000} onSubmit={onSubmit} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(/select store/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /at store/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/select store/i)).toBeInTheDocument();
    });

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /proceed to payment setup/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/please select a store/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/select store/i), '15');
    await user.click(screen.getByRole('button', { name: /proceed to payment setup/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        enrollmentMethod: 'at_store',
        storeId: '15',
      }),
    );
  });

  it('rejects invalid phone numbers and pincodes on submit', async () => {
    mockGetPrefill.mockResolvedValue(emptyPrefill);
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<PopPersonalDetailsForm monthlyInstalment={1000} onSubmit={onSubmit} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/^name/i), 'New User');
    await user.type(screen.getByLabelText(/phone number/i), '1234567890');
    await user.type(screen.getByLabelText(/^email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/address line 1/i), 'Street 1');
    await user.type(screen.getByLabelText(/^city/i), 'Pune');
    await user.type(screen.getByLabelText(/pincode/i), '012345');
    await user.click(screen.getByRole('checkbox', { name: /accept terms and conditions/i }));
    await user.click(screen.getByRole('button', { name: /proceed to payment setup/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/enter a valid 10-digit mobile number/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid 6-digit pincode/i)).toBeInTheDocument();
  });

  it('allows toggling autopay off', async () => {
    mockGetPrefill.mockResolvedValue(emptyPrefill);
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<PopPersonalDetailsForm monthlyInstalment={1000} onSubmit={onSubmit} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    });

    await fillRequiredFields(user);
    await user.click(screen.getByLabelText(/enable autopay/i));
    await user.click(screen.getByRole('button', { name: /proceed to payment setup/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        autopay: false,
        enrollmentMethod: 'online',
      }),
    );
  });
});
