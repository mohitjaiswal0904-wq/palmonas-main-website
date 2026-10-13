import {
  extractPopInstalmentItems,
  formatPopDaysLeft,
  formatPopInstalmentDate,
  resolvePopInstalmentKind,
  transformPopInstalmentItem,
  transformPopSubscriptionDetail,
} from '@/types/pop/subscription-detail';
import { popPlanDetailMessages } from '@/config/pop.config';

describe('pop subscription detail transforms', () => {
  it('formatPopInstalmentDate renders compact Indian dates', () => {
    expect(formatPopInstalmentDate('2026-03-05T00:00:00.000Z')).toMatch(/5 Mar 2026/);
  });

  it('formatPopDaysLeft pluralises remaining days', () => {
    expect(formatPopDaysLeft(4)).toBe(popPlanDetailMessages.daysLeft.replace('{count}', '4'));
    expect(formatPopDaysLeft(1)).toBe(popPlanDetailMessages.dayLeft);
  });

  it('resolvePopInstalmentKind maps paid and bonus rows', () => {
    expect(resolvePopInstalmentKind({ status: 'paid' })).toBe('paid');
    expect(resolvePopInstalmentKind({ is_bonus: true })).toBe('bonus');
    expect(resolvePopInstalmentKind({ status: 'pending' })).toBe('upcoming');
  });

  it('extractPopInstalmentItems reads nested items arrays', () => {
    const items = extractPopInstalmentItems({
      data: {
        items: [{ id: 1, status: 'paid' }],
      },
    });

    expect(items).toHaveLength(1);
  });

  it('transformPopInstalmentItem maps paid row with receipt fields', () => {
    const instalment = transformPopInstalmentItem(
      {
        id: 1,
        instalment_number: 1,
        status: 'paid',
        amount_paise: 300000,
        paid_at: '2026-03-05T00:00:00.000Z',
        payment_method: 'upi',
        receipt_url: 'https://receipt.example/1',
      },
      1,
      3000,
    );

    expect(instalment.kind).toBe('paid');
    expect(instalment.title).toBe('Instalment 1');
    expect(instalment.statusLabel).toBe(popPlanDetailMessages.paidStatus);
    expect(instalment.paymentMethod).toBe('UPI');
    expect(instalment.receiptUrl).toBe('https://receipt.example/1');
  });

  it('transformPopSubscriptionDetail appends bonus month and sorts rows', () => {
    const detail = transformPopSubscriptionDetail(
      {
        subscription: {
          id: 9,
          amount_paise: 300000,
          paid_count: 2,
          total_count: 5,
        },
        items: [
          { id: 2, instalment_number: 2, status: 'paid', amount_paise: 300000 },
          { id: 1, instalment_number: 1, status: 'paid', amount_paise: 300000 },
          { id: 3, instalment_number: 3, status: 'pending', amount_paise: 300000, days_left: 4 },
        ],
      },
      '9',
    );

    expect(detail.subscriptionId).toBe('9');
    expect(detail.instalments[0]?.sequence).toBe(1);
    expect(detail.instalments.at(-1)?.kind).toBe('bonus');
  });
});
