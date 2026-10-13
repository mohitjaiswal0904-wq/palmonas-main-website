import { postToGoogleAppsScript, readFileAsBase64 } from '@/lib/careers/google-apps-script';

describe('google-apps-script helpers', () => {
  it('reads a file as base64 without the data URL prefix', async () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const result = await readFileAsBase64(file);

    expect(result.base64).toBe(btoa('hello'));
    expect(result.mime).toBe('text/plain');
  });

  it('rejects when FileReader returns an empty result', async () => {
    const file = new File([''], 'empty.txt', { type: 'text/plain' });
    const original = FileReader.prototype.readAsDataURL;

    FileReader.prototype.readAsDataURL = function mockRead() {
      Object.defineProperty(this, 'result', { value: 'data:text/plain;base64,' });
      this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>);
    };

    await expect(readFileAsBase64(file)).rejects.toThrow(/Could not read the file/);

    FileReader.prototype.readAsDataURL = original;
  });

  it('posts fields through a hidden form targeting an iframe', async () => {
    const submitSpy = jest.fn();
    const originalCreate = document.createElement.bind(document);

    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreate(tagName);

      if (tagName === 'form') {
        Object.defineProperty(element, 'submit', {
          value: submitSpy,
          configurable: true,
        });
      }

      if (tagName === 'iframe') {
        queueMicrotask(() => {
          element.dispatchEvent(new Event('load'));
          queueMicrotask(() => {
            element.dispatchEvent(new Event('load'));
          });
        });
      }

      return element;
    });

    await postToGoogleAppsScript('https://script.google.com/macros/s/test/exec', {
      name: 'Ada',
      email: 'ada@example.com',
    });

    expect(submitSpy).toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it('rejects when form submit throws', async () => {
    const originalCreate = document.createElement.bind(document);

    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreate(tagName);

      if (tagName === 'form') {
        Object.defineProperty(element, 'submit', {
          value: () => {
            throw new Error('submit blocked');
          },
          configurable: true,
        });
      }

      if (tagName === 'iframe') {
        queueMicrotask(() => {
          element.dispatchEvent(new Event('load'));
        });
      }

      return element;
    });

    await expect(
      postToGoogleAppsScript('https://script.google.com/macros/s/test/exec', { name: 'Ada' }),
    ).rejects.toThrow(/submit blocked/);

    jest.restoreAllMocks();
  });
});
