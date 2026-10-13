/**
 * Posts form fields to a Google Apps Script web app via a hidden iframe.
 *
 * Apps Script endpoints do not return CORS headers for `fetch`, so the live
 * careers page uses a form POST into a hidden iframe. This helper mirrors that.
 *
 * @param endpoint - Apps Script `/exec` URL.
 * @param fields - Key/value pairs to submit as hidden inputs.
 * @param timeoutMs - Fallback completion timeout when iframe load is unreliable.
 * @returns Resolves when the iframe load cycle completes or the timeout fires.
 * @throws {Error} When `document` is unavailable (non-browser environments).
 */
export async function postToGoogleAppsScript(
  endpoint: string,
  fields: Record<string, string>,
  timeoutMs = 12_000,
): Promise<void> {
  if (typeof document === 'undefined') {
    throw new Error('Google Apps Script submissions require a browser environment');
  }

  await new Promise<void>((resolve, reject) => {
    const iframeName = `gsheet-${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.title = 'Form response';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;clip:rect(0,0,0,0)';

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = endpoint;
    form.target = iframeName;
    form.acceptCharset = 'UTF-8';

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    let finished = false;

    const cleanup = () => {
      try {
        document.body.removeChild(form);
      } catch {
        /* already removed */
      }
      try {
        document.body.removeChild(iframe);
      } catch {
        /* already removed */
      }
    };

    const done = () => {
      if (finished) {
        return;
      }
      finished = true;
      window.clearTimeout(fallbackTimer);
      cleanup();
      resolve();
    };

    const fallbackTimer = window.setTimeout(done, timeoutMs);

    document.body.appendChild(iframe);
    document.body.appendChild(form);

    iframe.addEventListener('load', function afterBlank() {
      iframe.removeEventListener('load', afterBlank);
      iframe.addEventListener('load', function afterAppsScript() {
        iframe.removeEventListener('load', afterAppsScript);
        done();
      });
      try {
        form.submit();
      } catch (error) {
        finished = true;
        window.clearTimeout(fallbackTimer);
        cleanup();
        reject(error instanceof Error ? error : new Error('Failed to submit application'));
      }
    });

    iframe.src = 'about:blank';
  });
}

/**
 * Reads a File as a base64 payload (without the data-URL prefix).
 *
 * @param file - Resume file selected by the applicant.
 * @returns Base64 string and MIME type.
 * @throws {Error} When the file cannot be read.
 */
export async function readFileAsBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';

      if (!base64) {
        reject(new Error('Could not read the file'));
        return;
      }

      resolve({
        base64,
        mime: file.type || 'application/octet-stream',
      });
    };

    reader.onerror = () => {
      reject(new Error('Could not read the file'));
    };

    reader.readAsDataURL(file);
  });
}
