import { render, screen, waitFor } from '@testing-library/react';

import { PincodeChecker } from '@/components/product/PincodeChecker';
import { pincodeMessages } from '@/config/pincode/pincode.config';
import { productMessages } from '@/config/product/product.config';
import { PRODUCT_CATEGORY } from '@/types/product';

const mockCheckEdd = jest.fn();
const mockValidatePincode = jest.fn();
const mockReset = jest.fn();
let mockIsValidating = false;
let mockEddResult:
  | {
      pincode: string;
      edd: string;
      shipsIn: string;
      orderWithin: string;
      status: string;
      store: null;
    }
  | undefined;

jest.mock('@/hooks/usePincode', () => ({
  usePincode: () => ({
    checkEdd: mockCheckEdd,
    validatePincode: mockValidatePincode,
    result: mockEddResult,
    error: null,
    reset: mockReset,
    isChecking: false,
    isValidating: mockIsValidating,
  }),
}));

const mockSaveDeliveryPincode = jest.fn();
let mockStoredPincode: string | null = null;
let mockPincodeHydrated = true;

jest.mock('@/providers/PincodeProvider', () => ({
  useDeliveryPincode: () => ({
    pincode: mockStoredPincode,
    pincodeHydrated: mockPincodeHydrated,
    setPincode: mockSaveDeliveryPincode,
    clearPincode: jest.fn(),
    isModalOpen: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}));

describe('PincodeChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoredPincode = null;
    mockPincodeHydrated = true;
    mockIsValidating = false;
    mockEddResult = undefined;
    mockCheckEdd.mockImplementation(async () => {
      mockEddResult = {
        pincode: '560001',
        edd: '2026-09-19',
        shipsIn: '',
        orderWithin: '',
        status: 'success',
        store: null,
      };

      return mockEddResult;
    });
  });

  it('auto-checks delivery when the header pincode is already saved', async () => {
    mockStoredPincode = '560001';

    const { rerender } = render(
      <PincodeChecker productCategory={PRODUCT_CATEGORY.DEMIFINE} inStock />,
    );

    await waitFor(() => {
      expect(mockCheckEdd).toHaveBeenCalledWith({
        pincode: '560001',
        inStock: true,
        type: 'demifine',
      });
    });

    rerender(<PincodeChecker productCategory={PRODUCT_CATEGORY.DEMIFINE} inStock />);

    await waitFor(() => {
      expect(screen.getByText('560001')).toBeInTheDocument();
    });
  });

  it('renders the manual checker when no header pincode is saved', () => {
    render(<PincodeChecker productCategory={PRODUCT_CATEGORY.DEMIFINE} inStock />);

    expect(screen.getByLabelText(productMessages.enterPincode)).toBeInTheDocument();
    expect(mockCheckEdd).not.toHaveBeenCalled();
  });

  it('keeps the validating message on one line', () => {
    mockIsValidating = true;

    render(<PincodeChecker productCategory={PRODUCT_CATEGORY.DEMIFINE} inStock />);

    const input = screen.getByLabelText(productMessages.enterPincode);
    const button = screen.getByText(pincodeMessages.validating).closest('button');

    expect(input).toHaveClass('w-full', 'pr-40');
    expect(input.parentElement).toHaveClass('relative');
    expect(button).toHaveClass(
      'absolute',
      'whitespace-nowrap',
      'shrink-0',
    );
  });
});
