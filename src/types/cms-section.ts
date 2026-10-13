export type CmsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'pill'
  | 'icon-only'
  | 'full-width'
  | 'category-tile';

export type CmsActionType =
  | 'navigate'
  | 'redirect'
  | 'external'
  | 'collection'
  | 'product'
  | 'open';

export interface CmsAction {
  action_type?: string | null;
  action_value?: string | null;
}

export interface CmsSectionButton extends CmsAction {
  id?: string;
  text?: string;
  image_url?: string;
  image_id?: string;
  variant?: CmsButtonVariant | string;
  background_color?: string;
  text_color?: string;
  order?: number;
  is_visible?: boolean;
  products?: CmsCollectionProduct[];
}

export type CmsCardGridContentType = 'default' | 'image-only' | 'text-only' | 'image-text';

export interface CmsSectionCard extends CmsAction {
  id?: string;
  card_type?: CmsCardGridContentType | string;
  variant?: 'default' | 'gift' | 'style' | 'occasion' | 'festive-gifts' | 'image-text' | string;
  image_url?: string;
  image_id?: string;
  show_divider?: boolean;
  paragraphs?: string[];
  height?: string;
  width?: string;
  order?: number;
  is_visible?: boolean;
  metadata?: Record<string, unknown>;
  tailwind_class_names?: Record<string, string>;
}

/** Width-bounded CDN variant resolved on CMS v2 chunk/shell reads. */
export interface CmsMediaWidthSource {
  mediaId?: string;
  minWidth?: number;
  maxWidth?: number;
  key?: 'mobile' | 'tablet' | 'desktop' | string;
  url?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  mediaType?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface CmsMediaItem {
  mediaId?: string;
  mediaType?: 'image' | 'video' | string;
  url?: string;
  imageUrl?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  alt?: string;
  aspectRatio?: string;
  sources?: CmsMediaWidthSource[];
  action_type?: string | null;
  action_value?: string | null;
}

export interface CmsHeroSlide extends CmsAction {
  id: string;
  mediaId?: string | null;
  imageUrl?: string | null;
  url?: string | null;
  mediaType?: string;
  sources?: CmsMediaWidthSource[];
}

export interface CmsHeroCategory extends CmsAction {
  id: string;
  name: string;
  handle: string;
  mediaId?: string | null;
  imageUrl?: string | null;
  url?: string | null;
  sources?: CmsMediaWidthSource[];
}

export interface CmsCollectionProduct {
  id: string;
  title?: string;
  name?: string;
  handle?: string;
  imageUrl?: string;
  price?: number | { amount: string; currencyCode: string };
  originalPrice?: number;
  image?: { url: string } | null;
}

export interface CmsRichTextBlock {
  type?: string;
  tag?: string;
  text?: string;
  content?: string;
  url?: string;
  src?: string;
  alt?: string;
  linkUrl?: string;
  linkText?: string;
  styles?: Record<string, string | number>;
  style?: Record<string, string>;
}
