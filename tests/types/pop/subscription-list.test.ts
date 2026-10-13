import {
  extractPopSubscriptionItems,
  paiseToRupees,
  readPopApiStatus,
  readPopMonthlyAmount,
  readPopPaidCount,
  normalizePopSubscriptionApiItem,
  readPopRazorpaySubscriptionId,
  readPopSubscriptionTotal,
  resolvePopPlanCardKind,
  transformPopSubscriptionItem,
  transformPopSubscriptionList,
} from '@/types/pop/subscription-list';
import { getPopPlanStatusLabel } from '@/config/pop.config';

describe('pop subscription list transforms', () => {
  it('extractPopSubscriptionItems reads items from paginated data payload', () => {
    const items = extractPopSubscriptionItems({
      count: 1,
      total: 1,
      items: [{ id: 1, amount_paise: 300000 }],
    });

    expect(items).toHaveLength(1);
  });

  it('paiseToRupees converts POP API amounts', () => {
    expect(paiseToRupees(300000)).toBe(3000);
    expect(paiseToRupees(100000)).toBe(1000);
  });

  it('readPopMonthlyAmount prefers amount_paise', () => {
    expect(readPopMonthlyAmount({ amount_paise: 300000 })).toBe(3000);
  });

  it('getPopPlanStatusLabel maps created status', () => {
    expect(getPopPlanStatusLabel('created')).toBe('Created');
    expect(getPopPlanStatusLabel('active')).toBe('Active');
  });

  it('resolvePopPlanCardKind keeps created subscriptions on progress card', () => {
    expect(
      resolvePopPlanCardKind({
        status: 'created',
        paid_count: 0,
        total_count: 5,
        remaining_count: 4,
      }),
    ).toBe('progress');
  });

  it('resolvePopPlanCardKind returns redeemable for completed status', () => {
    expect(resolvePopPlanCardKind({ status: 'completed' })).toBe('redeemable');
    expect(resolvePopPlanCardKind({ status: 'active' })).toBe('progress');
  });

  it('readPopRazorpaySubscriptionId reads Razorpay subscription id', () => {
    expect(
      readPopRazorpaySubscriptionId({
        id: 1,
        razorpay_subscription_id: 'sub_RaNdOmId123',
      }),
    ).toBe('sub_RaNdOmId123');
  });

  it('readPopRazorpaySubscriptionId reads nested subscription payloads', () => {
    expect(
      readPopRazorpaySubscriptionId({
        subscription: {
          razorpay_subscription_id: 'sub_nested123',
          amount_paise: 100000,
        },
      }),
    ).toBe('sub_nested123');
  });

  it('normalizePopSubscriptionApiItem flattens nested subscription rows', () => {
    const normalized = normalizePopSubscriptionApiItem({
      subscription: {
        razorpay_subscription_id: 'sub_nested123',
        amount_paise: 100000,
        status: 'created',
      },
    });

    expect(normalized.razorpay_subscription_id).toBe('sub_nested123');
    expect(normalized.amount_paise).toBe(100000);
  });

  it('transformPopSubscriptionItem maps production POP list item shape', () => {
    const plan = transformPopSubscriptionItem({
      id: 1,
      amount_paise: 100000,
      status: 'created',
      paid_count: 0,
      total_count: 5,
      remaining_count: 4,
      razorpay_subscription_id: 'sub_SVNmGczKltfInW',
      razorpay_plan_id: 'plan_SVNm1nEyyMoCE9',
      phone_number: '9833290022',
      reference: '2',
      created_at: '2026-03-25T07:51:46.334829Z',
      updated_at: '2026-03-25T07:51:46.334829Z',
      custom_data: null,
      external_application_id: 1,
    });

    expect(plan?.razorpaySubscriptionId).toBe('sub_SVNmGczKltfInW');
    expect(plan?.id).toBe('1');
  });

  it('transformPopSubscriptionItem maps Razorpay POP fields', () => {
    const plan = transformPopSubscriptionItem({
      id: 1,
      razorpay_subscription_id: 'sub_RaNdOmId123',
      status: 'created',
      amount_paise: 100000,
      paid_count: 0,
      total_count: 5,
      remaining_count: 4,
    });

    expect(plan).toEqual({
      id: '1',
      razorpaySubscriptionId: 'sub_RaNdOmId123',
      apiStatus: 'created',
      statusLabel: 'Created',
      cardKind: 'progress',
      planName: 'Saving 5+1 Plan',
      monthlyAmount: 1000,
      paidSoFar: 0,
      totalValue: 6000,
      bonusAmount: 1000,
      redeemableAmount: 6000,
      paidCount: 0,
      totalCount: 5,
      remainingCount: 4,
    });
  });

  it('transformPopSubscriptionItem returns null without razorpay subscription id', () => {
    expect(
      transformPopSubscriptionItem({
        id: 1,
        status: 'created',
        amount_paise: 100000,
      }),
    ).toBeNull();
  });

  it('transformPopSubscriptionList handles production list envelope', () => {
    const result = transformPopSubscriptionList({
      count: 2,
      total: 2,
      limit: 50,
      offset: 0,
      items: [
        {
          id: 1,
          razorpay_subscription_id: 'sub_created',
          amount_paise: 300000,
          status: 'created',
        },
        {
          id: 2,
          razorpay_subscription_id: 'sub_completed',
          amount_paise: 100000,
          status: 'completed',
          total_redeemable_paise: 600000,
        },
      ],
    });

    expect(result.plans.map((plan) => plan.id)).toEqual(['2', '1']);
    expect(result.plans[0]?.cardKind).toBe('redeemable');
    expect(result.plans[1]?.statusLabel).toBe('Created');
    expect(result.total).toBe(2);
  });

  it('readPopSubscriptionTotal prefers API total count', () => {
    expect(readPopSubscriptionTotal({ total: 42, items: [] }, 0)).toBe(42);
    expect(readPopSubscriptionTotal({ count: 42, items: [] }, 0)).toBe(42);
  });
});
