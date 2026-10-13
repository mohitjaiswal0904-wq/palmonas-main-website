import { api } from '@/lib/api-client';
import { AppError } from '@/lib/errors';
import { ENDPOINTS } from '@/lib/endpoints';
import { getUserDetailsForPopPrefill } from '@/services/customer.service';

jest.mock('@/lib/api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('getUserDetailsForPopPrefill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches user details and returns POP prefills from the first address', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'User details retrieved successfully',
        data: {
          first_name: 'Pranav',
          last_name: 'Arya',
          email: 'pranavleo22@gmail.com',
          phone: '+919833290022',
          addresses: [
            {
              address1: 'CHS',
              address2: null,
              city: 'Navi Mumbai',
              zip: '400614',
            },
          ],
        },
      },
    });

    const result = await getUserDetailsForPopPrefill();

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.auth.me);
    expect(result).toEqual({
      name: 'Pranav Arya',
      phone: '9833290022',
      email: 'pranavleo22@gmail.com',
      addressLine1: 'CHS',
      addressLine2: '',
      city: 'Navi Mumbai',
      pincode: '400614',
    });
  });

  it('throws a normalised AppError when the request fails', async () => {
    mockApi.get.mockRejectedValue(new Error('network down'));

    await expect(getUserDetailsForPopPrefill()).rejects.toBeInstanceOf(AppError);
  });

  it('returns empty address fields when the user has no addresses', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: {
          first_name: 'Solo',
          last_name: 'User',
          email: 'solo@example.com',
          phone: '9876543210',
          addresses: [],
        },
      },
    });

    const result = await getUserDetailsForPopPrefill();

    expect(result.addressLine1).toBe('');
    expect(result.city).toBe('');
    expect(result.name).toBe('Solo User');
  });
});
