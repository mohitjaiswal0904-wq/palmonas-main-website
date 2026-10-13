import { footerFeatureConfig, footerMessages } from '@/config/layout/footer.config';

describe('footer.config', () => {
  it('exports newsletter toast copy for success and unavailable', () => {
    expect(footerMessages.toasts.success.length).toBeGreaterThan(0);
    expect(footerMessages.toasts.unavailable.length).toBeGreaterThan(0);
    expect(footerFeatureConfig.messages.toasts.error.length).toBeGreaterThan(0);
  });

  it('exports validation and a11y strings', () => {
    expect(footerMessages.validation.emailInvalid.length).toBeGreaterThan(0);
    expect(footerMessages.a11y.submitting.length).toBeGreaterThan(0);
    expect(footerMessages.labels.emailLabel.length).toBeGreaterThan(0);
  });

  it('keeps toast groups distinct so UI can pick the right message', () => {
    const { success, error, unavailable } = footerMessages.toasts;
    expect(new Set([success, error, unavailable]).size).toBe(3);
  });

  it('fails loudly if toast messages are emptied in config', () => {
    expect(footerMessages.toasts.success.trim()).not.toBe('');
    expect(footerMessages.toasts.error.trim()).not.toBe('');
  });
});
