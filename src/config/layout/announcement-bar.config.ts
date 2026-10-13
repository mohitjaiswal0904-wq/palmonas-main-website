import rawConfig from '@/config/layout/announcement-bar.config.json';

interface AnnouncementBarItemRaw {
  id: string;
  text: string;
  route: string;
}

interface AnnouncementBarRawConfig {
  constants: {
    rotationIntervalMs: number;
    slideDurationMs: number;
  };
  messages: {
    a11y: {
      regionLabel: string;
    };
  };
  items: AnnouncementBarItemRaw[];
}

const announcementBarConfig = rawConfig as AnnouncementBarRawConfig;

/** Milliseconds between announcement bar message rotations. */
export const announcementBarRotationIntervalMs = announcementBarConfig.constants.rotationIntervalMs;

/** Horizontal slide duration when the active announcement changes. */
export const announcementBarSlideDurationMs = announcementBarConfig.constants.slideDurationMs;

/** User-facing copy for the default announcement bar. */
export const announcementBarMessages = announcementBarConfig.messages;

export interface AnnouncementBarItem {
  id: string;
  text: string;
  route: string;
  /** Opens in a new tab — used for external CMS links. */
  external?: boolean;
}

/**
 * Normalises a storefront route from config.
 *
 * @param route - Path from announcement bar config.
 */
function normalizeAnnouncementBarRoute(route: string): string {
  const trimmed = route.trim();
  if (!trimmed) {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Rotating announcement bar entries with per-item routes from config. */
export const announcementBarItems: AnnouncementBarItem[] = announcementBarConfig.items.map(
  (item) => ({
    id: item.id,
    text: item.text,
    route: normalizeAnnouncementBarRoute(item.route),
  }),
);
