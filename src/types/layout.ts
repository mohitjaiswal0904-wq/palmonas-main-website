import { z } from 'zod';

import type { CmsMediaWidthSource } from '@/types/cms-section';

export const LayoutItemVisibilitySchema = z.object({
  web: z.boolean().optional(),
  app: z.boolean().optional(),
});

/** Loose schema for shell-resolved width variants on layout chrome images. */
export const LayoutMediaWidthSourceSchema = z.object({
  mediaId: z.string().optional(),
  minWidth: z.number().optional(),
  maxWidth: z.number().optional(),
  key: z.string().optional(),
  url: z.string().optional(),
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  mediaType: z.string().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const LayoutItemSchema: z.ZodType<LayoutItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    item_type: z.string(),
    label: z.string().nullish(),
    title: z.string().nullish(),
    name: z.string().nullish(),
    parent_id: z.string().nullable().optional(),
    action_type: z.string().nullish(),
    action_value: z.string().nullable().optional(),
    social_platform: z.string().nullable().optional(),
    icon_key: z.string().nullable().optional(),
    icon_url: z.string().nullable().optional(),
    resolved_icon_url: z.string().nullable().optional(),
    image_id: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    resolved_image_url: z.string().nullable().optional(),
    image_sources: z.array(LayoutMediaWidthSourceSchema).nullish(),
    icon_sources: z.array(LayoutMediaWidthSourceSchema).nullish(),
    is_visible: z.boolean().optional(),
    visibility: LayoutItemVisibilitySchema.optional(),
    stack_order: z.number().optional(),
    sort_order: z.number().optional(),
    resolved_dynamic: z.unknown().nullish(),
    extra_metadata: z.record(z.string(), z.unknown()).nullish(),
    children: z.array(LayoutItemSchema).nullish(),
  }),
);

export interface LayoutItemVisibility {
  web?: boolean;
  app?: boolean;
}

export interface LayoutItem {
  id: string;
  item_type: string;
  label?: string | null;
  title?: string | null;
  name?: string | null;
  parent_id?: string | null;
  action_type?: string | null;
  action_value?: string | null;
  social_platform?: string | null;
  icon_key?: string | null;
  icon_url?: string | null;
  resolved_icon_url?: string | null;
  image_id?: string | null;
  image_url?: string | null;
  resolved_image_url?: string | null;
  /** Shell-resolved responsive variants for logos / primary images (CMS v2). */
  image_sources?: CmsMediaWidthSource[] | null;
  /** Shell-resolved responsive variants for custom icons (CMS v2). */
  icon_sources?: CmsMediaWidthSource[] | null;
  is_visible?: boolean;
  visibility?: LayoutItemVisibility;
  stack_order?: number;
  sort_order?: number;
  resolved_dynamic?: unknown | null;
  extra_metadata?: Record<string, unknown> | null;
  children?: LayoutItem[] | null;
}

export const FooterSpacingSchema = z.object({
  top: z.number().optional(),
  right: z.number().optional(),
  bottom: z.number().optional(),
  left: z.number().optional(),
});

export const FooterConfigSchema = z.object({
  sticky: z.boolean().optional(),
  columns: z.number().optional(),
  copyright: z.string().nullable().optional(),
  link_color: z.string().optional(),
  text_color: z.string().optional(),
  heading_color: z.string().optional(),
  muted_text_color: z.string().optional(),
  border_color: z.string().optional(),
  background_color: z.string().optional(),
  compact_on_app: z.boolean().optional(),
  show_newsletter: z.boolean().optional(),
  show_social_row: z.boolean().optional(),
  show_app_download: z.boolean().optional(),
  show_popular_searches: z.boolean().optional(),
  show_trust_badges: z.boolean().optional(),
  newsletter_action_url: z.string().nullable().optional(),
  newsletter_placeholder: z.string().nullable().optional(),
  newsletter_heading: z.string().nullable().optional(),
  newsletter_input_border_color: z.string().optional(),
  popular_searches_heading: z.string().nullable().optional(),
  annual_returns_text: z.string().nullable().optional(),
  app_download_background_color: z.string().optional(),
  max_width_px: z.number().optional(),
  heading_underline_width_px: z.number().optional(),
  padding: FooterSpacingSchema.optional(),
  margin: FooterSpacingSchema.optional(),
});

export type FooterConfig = z.infer<typeof FooterConfigSchema>;

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  columns: 4,
  show_newsletter: false,
  show_social_row: true,
  sticky: false,
  compact_on_app: true,
  copyright: '© Palmonas. All rights reserved.',
  background_color: '#FFFFFF',
  text_color: '#222222',
  link_color: '#868686',
  muted_text_color: '#868686',
};

export interface FooterSlotViewModel {
  config: FooterConfig;
  items: LayoutItem[];
}

export const HeaderRowPaddingSchema = z.object({
  top: z.string().optional(),
  right: z.string().optional(),
  bottom: z.string().optional(),
  left: z.string().optional(),
});

export const HeaderRowShellSchema = z.object({
  row: z.number(),
  key: z.string().nullable().optional(),
  justify: z.string().nullable().optional(),
  wrap: z.boolean().optional(),
  gap_px: z.number().nullable().optional(),
  min_height_px: z.number().nullable().optional(),
  sticky: z.boolean().nullable().optional(),
  background_color: z.string().nullable().optional(),
  border_bottom_color: z.string().nullable().optional(),
  padding: HeaderRowPaddingSchema.nullable().optional(),
  items: z.array(LayoutItemSchema),
});

export type HeaderRowPadding = z.infer<typeof HeaderRowPaddingSchema>;
export type HeaderRowShell = z.infer<typeof HeaderRowShellSchema>;

export const HeaderConfigSchema = z.object({
  sticky: z.boolean().optional(),
  show_search: z.boolean().optional(),
  show_cart: z.boolean().optional(),
  show_account: z.boolean().optional(),
  link_color: z.string().optional(),
  text_color: z.string().optional(),
  background_color: z.string().optional(),
  border_color: z.string().optional(),
  logo_position: z.enum(['left', 'center']).optional(),
  max_visible_tabs: z.number().optional(),
});

export type HeaderConfig = z.infer<typeof HeaderConfigSchema>;

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  sticky: true,
  show_search: true,
  show_cart: true,
  show_account: true,
  logo_position: 'left',
};

export interface HeaderSlotViewModel {
  config: HeaderConfig;
  items: LayoutItem[];
  rows?: HeaderRowShell[];
}
