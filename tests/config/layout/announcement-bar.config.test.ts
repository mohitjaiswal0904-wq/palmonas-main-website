import {
  announcementBarItems,
  announcementBarRotationIntervalMs,
  announcementBarSlideDurationMs,
} from '@/config/layout/announcement-bar.config';

describe('announcement-bar.config', () => {
  it('exports four rotating announcements', () => {
    expect(announcementBarItems).toHaveLength(4);
    expect(announcementBarItems[0]?.text).toBe('Buy 1 Get 1 Free | Use Code - B1G1');
  });

  it('resolves per-item route from config', () => {
    for (const item of announcementBarItems) {
      expect(item.route).toBe('/collections/best-sellers');
    }
  });

  it('uses a positive rotation interval', () => {
    expect(announcementBarRotationIntervalMs).toBeGreaterThan(0);
  });

  it('uses a positive slide duration', () => {
    expect(announcementBarSlideDurationMs).toBeGreaterThan(0);
  });
});
