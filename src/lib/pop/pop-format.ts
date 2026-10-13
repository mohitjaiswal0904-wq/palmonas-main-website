/** Formats an amount in Indian Rupees. */
export function formatPopCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formats POP subscription status for display. */
export function formatPopStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
