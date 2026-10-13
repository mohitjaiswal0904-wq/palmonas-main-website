import { mediaConfig, mediaMessages, VIDEO_LAZY_LOAD_ROOT_MARGIN } from '@/config/media/media.config';

describe('media.config', () => {
  it('exports a11y play and pause labels', () => {
    expect(mediaMessages.a11y.play).toBe('Play video');
    expect(mediaMessages.a11y.pause).toBe('Pause video');
  });

  it('exports fullscreen and seek labels', () => {
    expect(mediaMessages.a11y.fullscreen).toBeTruthy();
    expect(mediaMessages.a11y.seek).toBeTruthy();
  });

  it('keeps messages nested under the config root', () => {
    expect(mediaConfig.messages).toBe(mediaMessages);
  });

  it('does not expose volume or mute copy', () => {
    const a11yKeys = Object.keys(mediaMessages.a11y);

    expect(a11yKeys.some((key) => /mute|volume|speaker/i.test(key))).toBe(false);
  });

  it('exports a lazy-load root margin for silent videos', () => {
    expect(VIDEO_LAZY_LOAD_ROOT_MARGIN).toBe('200px');
    expect(mediaConfig.lazyLoadRootMargin).toBe(VIDEO_LAZY_LOAD_ROOT_MARGIN);
  });

  it('keeps lazy-load root margin as a CSS length', () => {
    expect(VIDEO_LAZY_LOAD_ROOT_MARGIN).toMatch(/^\d+px$/);
  });
});
