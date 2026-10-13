import { DEFAULT_CURRENCY } from '@/lib/constants';

export function formatPrice(amount: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
