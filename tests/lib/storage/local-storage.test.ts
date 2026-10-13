import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from '@/lib/storage/local-storage';

describe('local-storage', () => {
  const key = 'test-key';

  beforeEach(() => {
    localStorage.clear();
  });

  it('writes and reads a value', () => {
    writeLocalStorage(key, 'hello');
    expect(readLocalStorage(key)).toBe('hello');
  });

  it('returns undefined for missing keys', () => {
    expect(readLocalStorage('missing')).toBeUndefined();
  });

  it('removes a stored value', () => {
    writeLocalStorage(key, 'hello');
    removeLocalStorage(key);
    expect(readLocalStorage(key)).toBeUndefined();
  });
});
