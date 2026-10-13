/** @jest-environment node */

import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from '@/lib/storage/local-storage';

describe('local-storage (SSR)', () => {
  it('readLocalStorage returns undefined without window', () => {
    expect(readLocalStorage('key')).toBeUndefined();
  });

  it('writeLocalStorage is a no-op without window', () => {
    expect(() => writeLocalStorage('key', 'value')).not.toThrow();
  });

  it('removeLocalStorage is a no-op without window', () => {
    expect(() => removeLocalStorage('key')).not.toThrow();
  });
});
