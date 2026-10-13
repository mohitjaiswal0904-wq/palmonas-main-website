/** Plan of Purchase UI copy and calculator constants. */

export const POP_MIN_MONTHLY_AMOUNT = 1_000;

export const POP_AMOUNT_STEP = 1_000;

export const POP_DEFAULT_MONTHLY_AMOUNT = 3_000;

export const POP_MAX_MONTHLY_AMOUNT = 50_000;

export const POP_PAID_MONTHS = 5;

export const POP_TOTAL_MONTHS = 6;

export const POP_HERO = {
  title: 'Pay 5, Get 6',
  subtitle: 'A flexible monthly savings plan for your dream jewellery.',
  highlights: [
    { label: '5+1 Monthly Plan', description: 'Pay for 5 months' },
    { label: '100% Secure', description: 'Safe & insured savings' },
    { label: 'Free 6th Month', description: 'Bonus month on us' },
  ],
} as const;

export const POP_HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Enroll in Plan',
    description: 'Choose your monthly instalment amount and register.',
  },
  {
    step: 2,
    title: 'Pay for 5 Months',
    description: 'Pay for 5 months at your selected amount.',
  },
  {
    step: 3,
    title: 'Get 6th Month FREE',
    description: 'The 6th month value is added for free.',
  },
  {
    step: 4,
    title: 'Shop Your Choice',
    description: 'Redeem the plan value on any jewellery from our collection.',
  },
] as const;

export const POP_PLAN_FEATURES = [
  'Pay for only 5 months',
  '6 month contribution is FREE',
  'No hidden charges',
  'Buy any jewellery',
] as const;

export const POP_BENEFITS = [
  {
    title: 'Premium Collection',
    description: 'Access to gold, diamond, and platinum.',
  },
  {
    title: 'Extra Benefits',
    description: 'Discounts on making charges.',
  },
  {
    title: '100% Secure',
    description: 'Savings are safe and insured.',
  },
  {
    title: 'Flexible Plans',
    description: 'Choose amounts that suit your budget.',
  },
  {
    title: 'Instant Redemption',
    description: 'Redeem anytime after completion.',
  },
  {
    title: 'Lifetime Support',
    description: '24/7 customer service.',
  },
] as const;

export const POP_FAQ = {
  viewAllLabel: 'View All FAQs',
  viewAllDescription: '26 questions across various categories',
  popularQuestions: [
    'Minimum monthly amount: ₹1,000.',
    'Redemption Days: 151–210 (60-day window).',
    'Option to open multiple plans.',
  ],
} as const;
