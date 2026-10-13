import {
  mobileAppNudgeMessages,
  mobileAppNudgeStoreUrls,
} from '@/config/layout/mobile-app-nudge.config';

describe('mobile-app-nudge.config', () => {
  it('exports store URLs for iOS and Android', () => {
    expect(mobileAppNudgeStoreUrls.iosUrl).toContain('apps.apple.com');
    expect(mobileAppNudgeStoreUrls.androidUrl).toContain('play.google.com');
  });

  it('exports nudge copy', () => {
    expect(mobileAppNudgeMessages.labels.title).toBe('Get the app now');
    expect(mobileAppNudgeMessages.labels.cta).toBe('Open in App');
  });
});
