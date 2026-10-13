/** Test fixtures for gold limited-time offer + making-charges (not product config mocks). */

export const goldLimitedTimeOfferFixture = {
  title: 'Flat 15% off on MRP',
  description: 'Flat 15% off on orders below Rs 20k/-',
  code: 'XXXXXX',
  showCouponCode: true,
  freebieImageUrl: '',
  freebieRoute: '',
  showViewDetails: false,
} as const;

export const makingChargesLabelFixture = '0% Making charges';
