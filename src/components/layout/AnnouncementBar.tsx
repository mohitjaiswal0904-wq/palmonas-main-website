'use client';

import { RotatingAnnouncementBar } from '@/components/layout/RotatingAnnouncementBar';
import {
  announcementBarItems,
  announcementBarMessages,
} from '@/config/layout/announcement-bar.config';

/**
 * Default rotating announcement bar above the site header.
 */
export function AnnouncementBar() {
  return (
    <RotatingAnnouncementBar
      items={announcementBarItems}
      className="bg-black px-4 py-1.5 text-sm font-medium text-white"
      regionLabel={announcementBarMessages.a11y.regionLabel}
    />
  );
}
