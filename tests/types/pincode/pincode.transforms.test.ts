import { transformPincodeValidation } from '@/types/pincode/pincode.transforms';

describe('transformPincodeValidation', () => {
  it('returns valid when India Post reports success with post offices', () => {
    const result = transformPincodeValidation('110001', {
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
    });

    expect(result.valid).toBe(true);
    expect(result.pincode).toBe('110001');
    expect(result.postOffices).toHaveLength(1);
    expect(result.message).toBe('Number of pincode(s) found:1');
  });

  it('returns invalid when India Post reports error with null post offices', () => {
    const result = transformPincodeValidation('000000', {
      Message: 'No records found',
      Status: 'Error',
      PostOffice: null,
    });

    expect(result.valid).toBe(false);
    expect(result.postOffices).toEqual([]);
    expect(result.message).toBe('Invalid pincode');
  });

  it('uses invalid pincode copy when error response has empty message', () => {
    const result = transformPincodeValidation('000000', {
      Message: '   ',
      Status: 'Error',
      PostOffice: null,
    });

    expect(result.valid).toBe(false);
    expect(result.message).toBe('Invalid pincode');
  });

  it('returns invalid when success status has empty post office list', () => {
    const result = transformPincodeValidation('110001', {
      Message: 'No records found',
      Status: 'Success',
      PostOffice: [],
    });

    expect(result.valid).toBe(false);
    expect(result.postOffices).toEqual([]);
  });
});
