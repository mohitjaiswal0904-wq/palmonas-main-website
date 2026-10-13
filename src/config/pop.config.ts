export const POP_MIN_INSTALMENT = 1000;
export const POP_MAX_INSTALMENT = 50_000;
export const POP_INSTALMENT_STEP = 1000;
export const POP_PAID_MONTHS = 5;
export const POP_TOTAL_MONTHS = 6;
export const POP_DEFAULT_INSTALMENT = 3000;

export type PopStep = 'overview' | 'savings' | 'details';

/** How the customer enrols in the POP plan. */
export type PopEnrollmentMethod = 'online' | 'at_store';

export interface PopHowItWorksStep {
  title: string;
  /** Optional mobile-only title when Figma copy differs from desktop. */
  mobileTitle?: string;
  description: string;
  icon: 'user-plus' | 'calendar' | 'gift' | 'shopping-bag';
}

export interface PopBenefit {
  title: string;
  description: string;
  icon: 'gem' | 'percent' | 'shield' | 'sliders' | 'zap' | 'headphones';
}

export interface PopFaqItem {
  text: string;
}

export const popHeroHighlights = [
  { value: '5+1', label: 'Monthly Plan' },
  { value: '100%', label: 'Secure' },
  { value: 'Free', label: '6th Month' },
] as const;

export const popHowItWorksSteps: PopHowItWorksStep[] = [
  {
    title: 'Enroll in Plan',
    description: 'Choose your monthly instalment amount and register',
    icon: 'user-plus',
  },
  {
    title: 'Pay for 5 Months',
    description: 'Pay for 5 months at your selected amount',
    icon: 'calendar',
  },
  {
    title: 'Get 6th Month FREE',
    description: "We add the 6th month's value to your plan absolutely free!",
    icon: 'gift',
  },
  {
    title: 'Shop Your Choice',
    mobileTitle: 'Redeem on Any 9KT Jewellery',
    description: 'Redeem your plan value on 9KT jewellery from our collection',
    icon: 'shopping-bag',
  },
];

export const popPlanPerks = [
  'Pay for only 5 months',
  '6th month contribution is FREE',
  'No hidden charges',
  'Early withdrawal option',
  'Buy any jewellery from 9KT collection',
] as const;

export const popBenefits: PopBenefit[] = [
  {
    title: 'Premium Collection',
    description: 'Access to our entire range of Gold & Diamond jewellery',
    icon: 'gem',
  },
  {
    title: 'Extra Benefits',
    description: 'Get discounts on making charges & special offers',
    icon: 'percent',
  },
  {
    title: '100% Secure',
    description: 'Your savings are completely safe and insured',
    icon: 'shield',
  },
  {
    title: 'Flexible Plans',
    description: 'Choose instalment amounts that suit your budget',
    icon: 'sliders',
  },
  {
    title: 'Instant Redemption',
    description: 'Redeem your plan anytime after completion',
    icon: 'zap',
  },
  {
    title: 'Lifetime Support',
    description: '24/7 customer service for all your queries',
    icon: 'headphones',
  },
];

export const popFaqHighlights: PopFaqItem[] = [
  { text: 'Minimum monthly amount: ₹1,000' },
  { text: 'Redemption: Days 151 - 210 (60 day window)' },
  { text: 'You can open multiple plans.' },
];

export const popTermsHref = '/pages/pop-faqs#terms';

/** POP active plan entry point and my-plan page copy. */
export const popActivePlanMessages = {
  title: 'My Active Plan',
  subtitle: 'View instalments & progress',
  linkAriaLabel: 'View your active POP plan instalments and progress',
  pageTitle: 'All Saving Plans',
  pageDescription: 'Your instalments and plan progress will appear here soon.',
  backAriaLabel: 'Back to POP savings plan',
  emptyTitle: 'No saving plans yet',
  emptyDescription: 'Start a Pay 5, Get 6 plan to see your instalments and progress here.',
  startPlanCta: 'Start Saving',
  loadError: 'Could not load your saving plans. Please try again.',
  retry: 'Try again',
} as const;

export const popPlanCardMessages = {
  planSummary: 'Plan Summary',
  defaultPlanName: 'Saving 5+1 Plan',
  statusCreated: 'Created',
  statusActive: 'Active',
  statusPending: 'Pending',
  statusHalted: 'Paused',
  statusCancelled: 'Cancelled',
  statusRedeemable: 'Ready',
  monthly: 'Monthly',
  paidSoFar: 'Paid So Far',
  totalValue: 'Total Value',
  congratulations: 'Congratulations! 🎉',
  allInstalmentsCompleted: 'All instalments completed',
  readyToRedeem: 'Ready to Redeem',
  includingBonus: 'Including {amount} bonus',
  redeem: 'Redeem',
  redeemAriaLabel: 'Redeem your completed saving plan',
} as const;

const POP_PLAN_STATUS_LABELS: Record<string, string> = {
  created: popPlanCardMessages.statusCreated,
  active: popPlanCardMessages.statusActive,
  authenticated: popPlanCardMessages.statusActive,
  pending: popPlanCardMessages.statusPending,
  halted: popPlanCardMessages.statusHalted,
  cancelled: popPlanCardMessages.statusCancelled,
  completed: popPlanCardMessages.statusRedeemable,
  redeemable: popPlanCardMessages.statusRedeemable,
};

/**
 * Maps a POP subscription API status to user-facing badge copy.
 *
 * @param apiStatus - Raw status from GET /api/v2/pop/subscriptions.
 * @returns Localised status label for the plan card badge.
 */
export function getPopPlanStatusLabel(apiStatus: string): string {
  const key = apiStatus.toLowerCase();
  return POP_PLAN_STATUS_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/** Shared POP plan card gradients from Figma. */
export const popPlanGradients = {
  activeHeader:
    'linear-gradient(94.84deg, rgba(113, 255, 234, 0.1) 3.91%, rgba(255, 120, 199, 0.1) 99.39%)',
  redeemHeader: 'linear-gradient(90deg, rgb(255, 235, 180) 0%, rgb(255, 251, 233) 100%)',
} as const;

export const POP_MY_PLAN_PATH = '/pop/my-plan';

/** Builds the POP plan details route using the Razorpay subscription id. */
export function buildPopPlanDetailPath(razorpaySubscriptionId: string): string {
  return `${POP_MY_PLAN_PATH}/${encodeURIComponent(razorpaySubscriptionId)}`;
}

export const popPlanDetailMessages = {
  pageTitle: 'Details Page',
  backAriaLabel: 'Back to all saving plans',
  loadError: 'Could not load plan details. Please try again.',
  retry: 'Try again',
  instalmentTitle: 'Instalment {number}',
  bonusMonthTitle: 'Bonus Month',
  paidOn: 'Paid on {date}',
  dueOn: 'Due on {date}',
  availableFrom: 'Available from {date}',
  paidStatus: '✓ Paid',
  daysLeft: '{count} days left',
  dayLeft: '1 day left',
  viewReceipt: 'View Receipt',
  viewReceiptAriaLabel: 'View receipt for {title}',
  bonusMessage: '🎉 You get this month absolutely FREE as a bonus!',
  freeLabel: 'FREE',
  openPlanAriaLabel: 'View instalment details for {planName}',
} as const;

/** Shown when a guest tries to start the POP savings flow. */
export const popLoginRequiredMessage = 'Please log in to start your POP savings plan';
