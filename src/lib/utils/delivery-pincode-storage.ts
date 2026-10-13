import { DELIVERY_PINCODE_STORAGE_KEY } from '@/config/pincode/pincode.config';
import { pincodeValidator } from '@/lib/validators';

export function readDeliveryPincodeFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const item = window.localStorage.getItem(DELIVERY_PINCODE_STORAGE_KEY);

    if (!item) {
      return null;
    }

    const parsed: unknown = JSON.parse(item);
    const result = pincodeValidator.safeParse(parsed);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function writeDeliveryPincodeToStorage(pincode: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (pincode) {
    window.localStorage.setItem(DELIVERY_PINCODE_STORAGE_KEY, JSON.stringify(pincode));
    return;
  }

  window.localStorage.removeItem(DELIVERY_PINCODE_STORAGE_KEY);
}
