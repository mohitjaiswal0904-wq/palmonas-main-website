/** Wallet page copy and FAQ content. */

export const WALLET_RECENT_TRANSACTION_LIMIT = 3;

export const WALLET_BALANCE_SUBTEXT = 'Available for all purchases and transactions';

export const WALLET_BENEFITS = [
  {
    icon: '⚡',
    title: 'Lightning Fast Checkout',
    description: 'Complete purchases in seconds without entering payment details every time',
  },
  {
    icon: '🔒',
    title: 'Safe & Secure',
    description: 'Your money is protected with bank-level security and encryption',
  },
  {
    icon: '🎁',
    title: 'Exclusive Offers',
    description: 'Get special cashback and promotional credits when you use your wallet',
  },
] as const;

export const WALLET_FAQS = [
  {
    question: 'Is my money safe?',
    answer:
      'Yes. Your Palmonas wallet balance is protected with secure encryption and can only be used on Palmonas purchases linked to your account.',
  },
  {
    question: 'Can I withdraw my wallet balance?',
    answer:
      'Wallet balance is meant for purchases on Palmonas. Withdrawals are not supported unless covered by a specific refund or store credit policy.',
  },
  {
    question: 'What payment methods can I use?',
    answer:
      'You can top up or use wallet balance alongside UPI, cards, and other supported checkout methods where wallet redemption is enabled.',
  },
] as const;
