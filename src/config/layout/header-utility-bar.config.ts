import rawConfig from '@/config/layout/header-utility-bar.config.json';

export interface HeaderUtilityBarVisibility {
  showStoreLocator: boolean;
  showCart: boolean;
  showWishlist: boolean;
  showAccount: boolean;
  showPincode: boolean;
  showSearchIcon: boolean;
  showSearch: boolean;
  /** Mobile-only: replace hamburger + logo with back + page title (PDP). */
  showBackNav: boolean;
  /** Mobile-only: with `showBackNav`, show an inline search field instead of a title. */
  showMobileSearchField: boolean;
}

interface HeaderUtilityBarBreakpointDefaults {
  mobile: HeaderUtilityBarVisibility;
  laptop: HeaderUtilityBarVisibility;
}

interface HeaderUtilityBarRouteConfigRaw {
  id: string;
  routes: string[];
  /** When false, sticky header is flat (no shadow/border/blur). Omit = true. */
  showHeaderElevation?: boolean;
  /** Copy key in `messages.labels` for the mobile back-nav title. */
  backNavTitleFromLabel?: keyof typeof rawConfig.messages.labels;
  mobile?: Partial<HeaderUtilityBarVisibility>;
  laptop?: Partial<HeaderUtilityBarVisibility>;
}

interface HeaderUtilityBarRawConfig {
  messages: typeof rawConfig.messages;
  defaults: HeaderUtilityBarBreakpointDefaults;
  routeConfigs: HeaderUtilityBarRouteConfigRaw[];
  mobileSearchReveal: {
    offset: number;
    tolerance: number;
    hideDistance: number;
    revealDistance: number;
    settleMs: number;
  };
}

const headerUtilityBarConfig = rawConfig as HeaderUtilityBarRawConfig;

export interface HeaderUtilityBarRouteConfig {
  id: string;
  routes: string[];
  showHeaderElevation?: boolean;
  /** Resolved mobile back-nav title from `backNavTitleFromLabel`. */
  backNavTitle?: string;
  mobile?: Partial<HeaderUtilityBarVisibility>;
  laptop?: Partial<HeaderUtilityBarVisibility>;
}

/** Default header utility visibility when no route override matches. */
export const headerUtilityBarDefaults: HeaderUtilityBarBreakpointDefaults =
  headerUtilityBarConfig.defaults;

/** Route-scoped overrides for header utility icons and pincode row. */
export const headerUtilityBarRouteConfigs: HeaderUtilityBarRouteConfig[] =
  headerUtilityBarConfig.routeConfigs.map((route) => ({
    id: route.id,
    routes: route.routes,
    showHeaderElevation: route.showHeaderElevation,
    backNavTitle: route.backNavTitleFromLabel
      ? headerUtilityBarConfig.messages.labels[route.backNavTitleFromLabel]
      : undefined,
    mobile: route.mobile,
    laptop: route.laptop,
  }));

/** User-facing copy for header utility bar controls. */
export const headerUtilityBarMessages = headerUtilityBarConfig.messages;

/** Mobile search-row hide/show thresholds (scroll jitter + collapse settle lock). */
export const headerMobileSearchReveal = headerUtilityBarConfig.mobileSearchReveal;
