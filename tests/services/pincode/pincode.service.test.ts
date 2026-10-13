import { mtoApi } from '@/lib/mto-api';
import { postalPincodeApi } from '@/lib/postal-pincode-api';
import { checkEdd, validatePincode } from '@/services/pincode.service';

jest.mock('@/lib/postal-pincode-api', () => ({
  postalPincodeApi: {
    get: jest.fn(),
  },
}));

jest.mock('@/lib/mto-api', () => ({
  mtoApi: {
    get: jest.fn(),
  },
}));

const mockPostalPincodeApi = postalPincodeApi as jest.Mocked<typeof postalPincodeApi>;
const mockMtoApi = mtoApi as jest.Mocked<typeof mtoApi>;

describe('pincode.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validatePincode', () => {
    it('returns valid result for India Post success response', async () => {
      mockPostalPincodeApi.get.mockResolvedValue({
        data: [
          {
            Message: 'Number of pincode(s) found:1',
            Status: 'Success',
            PostOffice: [
              {
                Name: 'Baroda House',
                Description: '',
                BranchType: 'Sub Post Office',
                DeliveryStatus: 'Non-Delivery',
                Circle: 'New Delhi',
                District: 'Central Delhi',
                Division: 'New Delhi Central',
                Region: 'Delhi',
                State: 'Delhi',
                Country: 'India',
              },
            ],
          },
        ],
      });

      const result = await validatePincode('110001');

      expect(mockPostalPincodeApi.get).toHaveBeenCalledWith('/pincode/110001');
      expect(result.valid).toBe(true);
      expect(result.pincode).toBe('110001');
    });

    it('returns invalid result for India Post error response', async () => {
      mockPostalPincodeApi.get.mockResolvedValue({
        data: [
          {
            Message: 'No records found',
            Status: 'Error',
            PostOffice: null,
          },
        ],
      });

      const result = await validatePincode('000000');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid pincode');
    });

    it('returns invalid result when API payload is empty', async () => {
      mockPostalPincodeApi.get.mockResolvedValue({ data: [] });

      const result = await validatePincode('000000');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid pincode');
    });

    it('throws normalised error when lookup request fails', async () => {
      mockPostalPincodeApi.get.mockRejectedValue(new Error('Network error'));

      await expect(validatePincode('110001')).rejects.toMatchObject({
        message: expect.any(String),
      });
    });
  });

  describe('checkEdd', () => {
    it('calls MTO EDD endpoint and transforms success response', async () => {
      mockMtoApi.get.mockResolvedValue({
        data: {
          status: 'success',
          pincode: '110001',
          edd: '3-5 days',
          ships_in: '2 days',
        },
      });

      const result = await checkEdd({
        pincode: '110001',
        inStock: true,
        type: 'demifine',
      });

      expect(mockMtoApi.get).toHaveBeenCalledWith('/api/edd', {
        params: {
          pincode: '110001',
          inStock: 'true',
          type: 'demifine',
        },
      });
      expect(result.pincode).toBe('110001');
      expect(result.edd).toBe('3-5 days');
    });
  });
});
