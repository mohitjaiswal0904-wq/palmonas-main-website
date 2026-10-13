import {
  calculatePopSavings,
  transformCreatePopSubscription,
  transformPopSubscription,
  transformPopSubscriptionDetail,
  transformPopSubscriptionsList,
} from '@/types/pop';

describe('pop.transforms', () => {
  it('calculates savings for monthly amount', () => {
    expect(calculatePopSavings(3000)).toEqual({
      monthlyAmount: 3000,
      totalInstallments: 15000,
      bonusAmount: 3000,
      redeemableAmount: 18000,
    });
  });

  it('transforms subscription list', () => {
    const page = transformPopSubscriptionsList({
      count: 1,
      total: 1,
      limit: 50,
      offset: 0,
      items: [
        {
          id: 22,
          amount_paise: 100000,
          created_at: '2026-03-27T05:58:44.771595Z',
          updated_at: '2026-03-27T05:58:44.771595Z',
          custom_data: null,
          external_application_id: 1,
          paid_count: 0,
          phone_number: '+919098393937',
          razorpay_plan_id: 'plan_test',
          razorpay_subscription_id: 'sub_test',
          reference: 'pop-ref',
          remaining_count: 4,
          status: 'created',
          total_count: 5,
        },
      ],
    });

    expect(page.items[0]?.monthlyAmount).toBe(1000);
    expect(page.items[0]?.subscriptionId).toBe('sub_test');
  });

  it('transforms create subscription response', () => {
    const result = transformCreatePopSubscription({
      billing_mode: 'automatic',
      custom_data: null,
      oms_reference: 'P-POP-3957',
      payment_mode: 'automatic',
      payment_url: 'https://rzp.io/rzp/test',
      plan_id: 'plan_test',
      reference: '2',
      status: 'created',
      subscription_id: 'sub_test',
      total_months: 5,
    });

    expect(result.paymentUrl).toBe('https://rzp.io/rzp/test');
    expect(result.subscriptionId).toBe('sub_test');
  });

  it('transforms subscription detail with invoices', () => {
    const detail = transformPopSubscriptionDetail({
      billing_mode: 'automatic',
      payment_mode: 'automatic',
      oms_reference: 'P-POP-3957',
      phone_number: '9098393937',
      subscription_id: 'sub_test',
      status: 'created',
      total_months: 5,
      invoices: {
        count: 1,
        items: [
          {
            id: 'inv_test',
            amount: 100000,
            amount_due: 100000,
            amount_paid: 0,
            created_at: 1783616149,
            currency: 'INR',
            status: 'issued',
            short_url: 'https://rzp.io/rzp/pay',
            line_items: [{ id: 'li_test', name: 'POP Monthly 1000', amount: 100000 }],
          },
        ],
      },
    });

    expect(detail.invoices[0]?.amount).toBe(1000);
    expect(detail.invoices[0]?.paymentUrl).toBe('https://rzp.io/rzp/pay');
  });

  it('transforms single subscription', () => {
    const subscription = transformPopSubscription({
      id: 381,
      amount_paise: 5500000,
      created_at: '2026-04-06T05:40:24.673041Z',
      updated_at: '2026-04-06T05:40:24.673041Z',
      custom_data: null,
      external_application_id: 0,
      paid_count: 0,
      phone_number: '+919098393937',
      razorpay_plan_id: 'plan_test',
      razorpay_subscription_id: 'sub_test',
      reference: '8759728701697',
      remaining_count: 4,
      status: 'created',
      total_count: 5,
    });

    expect(subscription.monthlyAmount).toBe(55000);
  });
});
