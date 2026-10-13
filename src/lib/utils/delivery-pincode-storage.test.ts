import { DELIVERY_PINCODE_STORAGE_KEY } from '@/config/pincode/pincode.config';
import {
  readDeliveryPincodeFromStorage,
  writeDeliveryPincodeToStorage,
} from '@/lib/utils/delivery-pincode-storage';

describe('delivery-pincode-storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns null when storage is empty', () => {
    expect(readDeliveryPincodeFromStorage()).toBeNull();
  });

  it('reads and writes a valid pincode', () => {
    writeDeliveryPincodeToStorage('221002');

    expect(window.localStorage.getItem(DELIVERY_PINCODE_STORAGE_KEY)).toBe('"221002"');
    expect(readDeliveryPincodeFromStorage()).toBe('221002');
  });

  it('returns null for invalid stored values', () => {
    window.localStorage.setItem(DELIVERY_PINCODE_STORAGE_KEY, '"12"');

    expect(readDeliveryPincodeFromStorage()).toBeNull();
  });

  it('clears storage when pincode is null', () => {
    writeDeliveryPincodeToStorage('221002');
    writeDeliveryPincodeToStorage(null);

    expect(readDeliveryPincodeFromStorage()).toBeNull();
  });
});
