import rawConfig from '@/config/media/media.config.json';

export type MediaConfig = typeof rawConfig;

export const mediaConfig = rawConfig as MediaConfig;

/** Localization-ready a11y copy for silent site videos. */
export const mediaMessages = mediaConfig.messages;

/** IntersectionObserver rootMargin before a silent video attaches `src`. */
export const VIDEO_LAZY_LOAD_ROOT_MARGIN = mediaConfig.lazyLoadRootMargin;
