import {
  toCreatePopSubscriptionRequest,
  toPopPaymentType,
  toPopSubscriptionSource,
  transformCreatePopSubscriptionResponse,
} from '@/types/pop/subscription';

const sampleDetails = {
  name: 'Pranav Arya',
  phone: '9833290022',
  email: 'pranavleo22@gmail.com',
  addressLine1: 'CHS',
  addressLine2: '',
  city: 'Navi Mumbai',
  pincode: '400614',
  enrollmentMethod: 'online' as const,
  storeId: '',
  autopay: true,
  acceptedTerms: true,
};

describe('POP subscription transforms', () => {
  it('maps enrollment and autopay to source and payment_type', () => {
    expect(toPopSubscriptionSource('online')).toBe('online');
    expect(toPopSubscriptionSource('at_store')).toBe('store');
    expect(toPopPaymentType(true)).toBe('automatic');
    expect(toPopPaymentType(false)).toBe('manual');
  });

  it('builds the create subscription request body', () => {
    expect(
      toCreatePopSubscriptionRequest({
        amount: 3000,
        details: {
          ...sampleDetails,
          enrollmentMethod: 'at_store',
          storeId: '15',
          autopay: false,
          addressLine2: 'Floor 2',
        },
        callbackUrl: 'https://palmonas.com/pop',
      }),
    ).toEqual({
      amount: 3000,
      source: 'store',
      payment_type: 'manual',
      callback_url: 'https://palmonas.com/pop',
      custom_data: {
        name: 'Pranav Arya',
        phone: '9833290022',
        email: 'pranavleo22@gmail.com',
        address_line_1: 'CHS',
        address_line_2: 'Floor 2',
        city: 'Navi Mumbai',
        pincode: '400614',
        enrollment_method: 'at_store',
        store_id: '15',
        autopay: false,
      },
    });
  });

  it('nulls empty address line 2 and store id for online enrollment', () => {
    const body = toCreatePopSubscriptionRequest({
      amount: 1000,
      details: sampleDetails,
      callbackUrl: 'https://palmonas.com/pop',
    });

    expect(body.custom_data.address_line_2).toBeNull();
    expect(body.custom_data.store_id).toBeNull();
    expect(body.payment_type).toBe('automatic');
    expect(body.source).toBe('online');
  });

  it('extracts payment URL from envelope data', () => {
    expect(
      transformCreatePopSubscriptionResponse({
        data: {
          id: 99,
          payment_url: 'https://pay.example/abc',
        },
      }),
    ).toEqual({
      id: '99',
      paymentUrl: 'https://pay.example/abc',
      raw: {
        data: {
          id: 99,
          payment_url: 'https://pay.example/abc',
        },
      },
    });
  });

  it('falls back when no payment URL is present', () => {
    expect(
      transformCreatePopSubscriptionResponse({
        data: { id: 'sub_1' },
      }),
    ).toEqual({
      id: 'sub_1',
      paymentUrl: undefined,
      raw: {
        data: { id: 'sub_1' },
      },
    });
  });
});
