'use client';

import { ChevronDown } from 'lucide-react';
import { useMemo, type CSSProperties } from 'react';

import { CmsMedia } from '@/components/cms/shared/CmsMedia';
import { FooterNewsletterForm } from '@/components/layout/Footer/FooterNewsletterForm';
import { FooterSocialGraphic } from '@/components/layout/Footer/FooterSocialGraphic';
import { AppLink } from '@/components/ui/AppLink';
import { parseMediaWidthSources, resolveMediaUrl } from '@/lib/utils/cms-media';
import { cn } from '@/lib/utils/cn';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import {
  buildItemTree,
  itemLabel,
  linkGroupChildOrder,
  resolveLinkGroupLabel,
} from '@/lib/utils/footer-layout';
import { footerRootStyle, resolveFooterTheme } from '@/lib/utils/footer-theme';
import { resolveLayoutItemHref } from '@/lib/utils/header';
import type { CmsMediaWidthSource } from '@/types/cms-section';
import type { FooterConfig, LayoutItem } from '@/types/layout';

interface FooterRendererProps {
  config: FooterConfig;
  items: LayoutItem[];
  platform?: 'web' | 'app';
  className?: string;
}

interface FooterImageMeta {
  alt?: string;
  image_url?: string;
  image_id?: string;
  action_type?: string;
  action_value?: string;
  sources?: CmsMediaWidthSource[];
}

function isVisible(item: LayoutItem, platform: 'web' | 'app'): boolean {
  if (item.is_visible === false) {
    return false;
  }

  const key = platform === 'app' ? 'app' : 'web';
  return item.visibility?.[key] !== false;
}

function filterTree(list: LayoutItem[], platform: 'web' | 'app'): LayoutItem[] {
  return list
    .filter((item) => isVisible(item, platform))
    .map((item) => ({
      ...item,
      children: item.children ? filterTree(item.children, platform) : [],
    }))
    .filter((item) => {
      if (item.item_type === 'footer_column' || item.item_type === 'link_group') {
        return (item.children?.length ?? 0) > 0;
      }

      return true;
    });
}

function getExtraBody(item: LayoutItem): string | null {
  const body = item.extra_metadata?.body;

  return typeof body === 'string' ? body : null;
}

function getExtraImages(item: LayoutItem): FooterImageMeta[] {
  const images = item.extra_metadata?.images;

  if (!Array.isArray(images)) {
    return [];
  }

  return images.flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null) {
      return [];
    }

    const record = entry as Record<string, unknown>;

    return [
      {
        alt: typeof record.alt === 'string' ? record.alt : undefined,
        image_url: typeof record.image_url === 'string' ? record.image_url : undefined,
        image_id: typeof record.image_id === 'string' ? record.image_id : undefined,
        action_type: typeof record.action_type === 'string' ? record.action_type : undefined,
        action_value: typeof record.action_value === 'string' ? record.action_value : undefined,
        sources: parseMediaWidthSources(record.sources),
      },
    ];
  });
}

function resolveFooterImageUrl(image: FooterImageMeta): string | null {
  return image.image_url ?? resolveMediaUrl(image.sources?.[0] ?? {}) ?? null;
}

function resolveImageHref(image: FooterImageMeta): string | null {
  if (!image.action_value) {
    return null;
  }

  if (image.action_type === 'external' || image.action_value.startsWith('http')) {
    return image.action_value;
  }

  if (image.action_type === 'collection') {
    return resolveCollectionPagePath(image.action_value);
  }

  if (image.action_value.startsWith('/')) {
    return image.action_value;
  }

  return null;
}

function isNavigableHref(href: string | null | undefined): href is string {
  return Boolean(href && (href.startsWith('/') || href.startsWith('http')));
}

function FooterLinkText({ item }: { item: LayoutItem }) {
  const label = itemLabel(item);
  const href = resolveLayoutItemHref(item);
  const className = cn(
    'text-[13px] leading-[22px] text-[var(--footer-link)] transition-opacity cursor-pointer hover:opacity-90',
  );

  if (isNavigableHref(href)) {
    const isExternal = href.startsWith('http');

    if (isExternal) {
      return (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }

    return (
      <AppLink href={href} className={className}>
        {label}
      </AppLink>
    );
  }

  return <span className={className}>{label}</span>;
}

function FooterNewsletterBlock({
  config,
  item,
  theme,
}: {
  config: FooterConfig;
  item?: LayoutItem;
  theme: ReturnType<typeof resolveFooterTheme>;
}) {
  const heading =
    itemLabel(item ?? { id: 'newsletter', item_type: 'newsletter', label: '' }) ||
    config.newsletter_heading ||
    'Subscribe to receive exciting offers!';
  const placeholder =
    (typeof item?.extra_metadata?.placeholder === 'string'
      ? item.extra_metadata.placeholder
      : null) ??
    config.newsletter_placeholder ??
    'Your email address';

  return (
    <FooterNewsletterForm
      heading={heading}
      placeholder={placeholder}
      actionUrl={config.newsletter_action_url}
      borderColor={config.newsletter_input_border_color ?? theme.borderColor}
    />
  );
}

function FooterTextBlock({ item }: { item: LayoutItem }) {
  const body = getExtraBody(item);
  const label = itemLabel(item);

  if (!label && !body) {
    return null;
  }

  const textColor =
    typeof item.extra_metadata?.style === 'object' &&
    item.extra_metadata.style !== null &&
    'text_color' in item.extra_metadata.style &&
    typeof item.extra_metadata.style.text_color === 'string'
      ? item.extra_metadata.style.text_color
      : undefined;

  return (
    <div className="mt-4">
      {label ? (
        <p className="text-[15.5px] leading-[22px] font-semibold text-[var(--footer-text)]">
          {label}
        </p>
      ) : null}
      {body ? (
        <p
          className={cn('text-[13px] leading-[22px]', label ? 'mt-1' : '')}
          style={{ color: textColor ?? 'var(--footer-muted)' }}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

function FooterColumnsBlock({ columns }: { columns: LayoutItem[] }) {
  if (columns.length === 0) {
    return null;
  }

  return (
    <div className="laptop:contents">
      <div className="laptop:hidden mt-8">
        {columns.map((column) => (
          <details
            key={column.id}
            className="group border-b border-black/5 text-[var(--footer-text)]"
          >
            <summary className="laptop:text-[var(--footer-text)] flex h-[53px] cursor-pointer list-none items-center justify-between py-3.5 text-base leading-6 font-medium text-[#222] [&::-webkit-details-marker]:hidden">
              {itemLabel(column)}
              <ChevronDown
                className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <ul className="space-y-2.5 pb-4">
              {(column.children ?? []).map((child) =>
                child.item_type === 'link' ? (
                  <li key={child.id}>
                    <FooterLinkText item={child} />
                  </li>
                ) : null,
              )}
            </ul>
          </details>
        ))}
      </div>

      {columns.map((column) => (
        <nav
          key={column.id}
          className="laptop:block hidden px-[15px]"
          aria-label={itemLabel(column) || 'Footer links'}
        >
          <h2 className="relative pb-2.5 text-base leading-5 font-medium text-[var(--footer-text)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-[60px] after:bg-[var(--footer-text)]">
            {itemLabel(column)}
          </h2>
          <ul className="mt-6 space-y-2.5">
            {(column.children ?? []).map((child) =>
              child.item_type === 'link' ? (
                <li key={child.id}>
                  <FooterLinkText item={child} />
                </li>
              ) : null,
            )}
          </ul>
        </nav>
      ))}
    </div>
  );
}

function FooterSocialBlock({ items }: { items: LayoutItem[] }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-2.5 border-t border-[#e6e6e6] pt-8 text-[var(--footer-link)]">
      {items.map((social) => {
        const href = resolveLayoutItemHref(social);
        const label = itemLabel(social) || social.social_platform || social.icon_key || 'Social';

        if (isNavigableHref(href)) {
          return (
            <a
              key={social.id}
              href={href}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6c6c6c] transition-opacity hover:opacity-70"
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FooterSocialGraphic item={social} className="h-3.5 w-3.5" />
            </a>
          );
        }

        return (
          <span
            key={social.id}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6c6c6c]"
            aria-label={label}
          >
            <FooterSocialGraphic item={social} className="h-3.5 w-3.5" />
          </span>
        );
      })}
    </div>
  );
}

function FooterAppDownloadBlock({ item, config }: { item: LayoutItem; config: FooterConfig }) {
  const images = getExtraImages(item);
  const body = getExtraBody(item);
  const backgroundColor =
    config.app_download_background_color ??
    (typeof item.extra_metadata?.style === 'object' &&
    item.extra_metadata.style !== null &&
    'background_color' in item.extra_metadata.style &&
    typeof item.extra_metadata.style.background_color === 'string'
      ? item.extra_metadata.style.background_color
      : '#FFEFEF');

  return (
    <div className="mt-8 rounded-xl px-5 py-5 text-center" style={{ backgroundColor }}>
      <p className="text-xl leading-7 font-semibold text-black">{itemLabel(item)}</p>
      {body ? (
        <p className="laptop:block mt-3 hidden text-sm leading-5 text-[#333]">{body}</p>
      ) : null}
      <div className="laptop:flex-row laptop:gap-5 mt-3 flex flex-col items-center justify-center gap-4">
        {images.map((image, index) => {
          const href = resolveImageHref(image);
          const src = resolveFooterImageUrl(image);
          const imageNode = src ? (
            <CmsMedia
              url={src}
              sources={image.sources}
              alt={image.alt ?? ''}
              className="laptop:w-auto laptop:object-contain h-[61px] w-[204px] object-cover"
            />
          ) : null;
          const key = `${image.alt ?? 'app'}-${src ?? index}`;

          if (href && imageNode) {
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={image.alt ?? 'Download app'}
              >
                {imageNode}
              </a>
            );
          }

          return imageNode ? <span key={key}>{imageNode}</span> : null;
        })}
      </div>
      {body ? <p className="laptop:hidden mt-3 text-sm leading-5 text-[#333]">{body}</p> : null}
    </div>
  );
}

function FooterImageRowBlock({ item }: { item: LayoutItem }) {
  const images = getExtraImages(item);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="laptop:max-w-none laptop:pb-4 mx-auto mt-8 flex max-w-[220px] flex-wrap items-center justify-center gap-2.5">
      {images.map((image, index) => {
        const src = resolveFooterImageUrl(image);

        return src ? (
          <CmsMedia
            key={`${image.alt ?? 'badge'}-${src}-${index}`}
            url={src}
            sources={image.sources}
            alt={image.alt ?? ''}
            className="h-[30px] w-auto object-contain"
          />
        ) : null;
      })}
    </div>
  );
}

function FooterInlineLinkRow({ links }: { links: LayoutItem[] }) {
  const visibleLinks = links
    .filter((item) => item.item_type === 'link')
    .sort((a, b) => linkGroupChildOrder(a) - linkGroupChildOrder(b));

  if (visibleLinks.length === 0) {
    return null;
  }

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed text-[var(--footer-link)]">
      {visibleLinks.map((link, index) => (
        <span key={link.id} className="inline-flex items-center gap-x-2">
          {index > 0 ? (
            <span aria-hidden="true" className="text-[var(--footer-muted)]">
              |
            </span>
          ) : null}
          <FooterLinkText item={link} />
        </span>
      ))}
    </p>
  );
}

function resolveLinkGroupRowStyle(group: LayoutItem): CSSProperties | undefined {
  const style = group.extra_metadata?.style;

  if (!style || typeof style !== 'object') {
    return undefined;
  }

  const padding =
    'padding' in style && style.padding && typeof style.padding === 'object'
      ? (style.padding as Record<string, unknown>)
      : null;
  const borderColor =
    'border_color' in style && typeof style.border_color === 'string'
      ? style.border_color
      : undefined;

  return {
    ...(borderColor ? { borderBottomColor: borderColor } : {}),
    ...(typeof padding?.top === 'number' ? { paddingTop: padding.top } : {}),
    ...(typeof padding?.bottom === 'number' ? { paddingBottom: padding.bottom } : {}),
  };
}

function FooterLinkGroupsBlock({
  groups,
  heading,
}: {
  groups: LayoutItem[];
  heading?: string | null;
}) {
  return (
    <div className="laptop:px-[15px] laptop:pt-[30px] border-t border-[#e6e6e6] px-4 py-8">
      <div className="mx-auto max-w-[1440px]">
        {heading ? (
          <h2 className="text-[23px] leading-8 font-semibold text-[var(--footer-text)]">
            {heading}
          </h2>
        ) : null}
        <div className="mt-2">
          {groups.map((group) => {
            const groupLabel = resolveLinkGroupLabel(group);
            const links = group.children ?? [];
            const rowStyle = resolveLinkGroupRowStyle(group);

            return (
              <nav
                key={group.id}
                className="border-b border-[#e9e9e9] py-2.5"
                aria-label={groupLabel || 'Popular searches'}
                style={rowStyle}
              >
                {groupLabel ? (
                  <h3 className="text-sm leading-5 font-normal text-[var(--footer-link)]">
                    {groupLabel}
                  </h3>
                ) : null}
                <FooterInlineLinkRow links={links} />
              </nav>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function FooterRenderer({
  config,
  items,
  platform = 'web',
  className = '',
}: FooterRendererProps) {
  const tree = useMemo(() => buildItemTree(items), [items]);
  const visible = useMemo(() => filterTree(tree, platform), [tree, platform]);

  const theme = useMemo(() => resolveFooterTheme(config), [config]);
  const rootStyle = useMemo(() => footerRootStyle(theme), [theme]) as CSSProperties;
  const compact = platform === 'app' && config.compact_on_app !== false;

  const rootSocial = visible.filter((item) => item.item_type === 'social');
  const newsletterItem = visible.find((item) => item.item_type === 'newsletter');
  const textBlocks = visible.filter((item) => item.item_type === 'text_block');
  const columns = visible.filter((item) => item.item_type === 'footer_column');
  const appDownloads = visible.filter((item) => item.item_type === 'app_download');
  const imageRows = visible.filter((item) => item.item_type === 'image_row');
  const linkGroups = visible.filter((item) => item.item_type === 'link_group');
  const miscItems = visible.filter(
    (item) => item.item_type === 'logo' || item.item_type === 'link',
  );
  const showNewsletter = Boolean(newsletterItem || config.show_newsletter);
  const hasMainContent =
    showNewsletter ||
    textBlocks.length > 0 ||
    columns.length > 0 ||
    rootSocial.length > 0 ||
    appDownloads.length > 0 ||
    imageRows.length > 0 ||
    miscItems.length > 0 ||
    Boolean(config.annual_returns_text);

  const shellStyle: CSSProperties = {
    ...rootStyle,
    ...(typeof config.padding?.bottom === 'number' ? { paddingBottom: config.padding.bottom } : {}),
    ...(typeof config.margin?.top === 'number' ? { marginTop: config.margin.top } : {}),
    ...(typeof config.margin?.bottom === 'number' ? { marginBottom: config.margin.bottom } : {}),
  };

  if (compact) {
    return (
      <footer className={cn('px-4 py-3', className)} style={shellStyle} aria-label="Site footer">
        <div className="container flex items-center justify-between gap-4">
          <div className="flex gap-3 text-[var(--footer-link)]">
            {rootSocial.slice(0, 4).map((social) => {
              const href = resolveLayoutItemHref(social);
              const label =
                itemLabel(social) || social.social_platform || social.icon_key || 'Social';

              if (isNavigableHref(href)) {
                return (
                  <a
                    key={social.id}
                    href={href}
                    className="opacity-70 transition-opacity hover:opacity-100"
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FooterSocialGraphic item={social} />
                  </a>
                );
              }

              return (
                <span key={social.id} className="opacity-70" aria-hidden>
                  <FooterSocialGraphic item={social} />
                </span>
              );
            })}
          </div>
        </div>
        {config.copyright ? (
          <p className="container mt-2 text-center text-[10px] text-[var(--footer-muted)]">
            {config.copyright}
          </p>
        ) : null}
      </footer>
    );
  }

  return (
    <footer
      className={cn('font-nunito-sans bg-white', className)}
      style={shellStyle}
      aria-label="Site footer"
    >
      {hasMainContent ? (
        <div
          className="laptop:px-[15px] laptop:pt-6 laptop:pb-0 mx-auto max-w-[1440px] px-4 py-10"
          style={config.max_width_px ? { maxWidth: config.max_width_px } : undefined}
        >
          <div className="laptop:grid laptop:grid-cols-4">
            <div className="laptop:px-[15px] laptop:pt-[3px]">
              {showNewsletter ? (
                <FooterNewsletterBlock config={config} item={newsletterItem} theme={theme} />
              ) : null}
              {textBlocks.map((item) => (
                <FooterTextBlock key={item.id} item={item} />
              ))}
              {miscItems.map((item) =>
                item.item_type === 'logo' && (item.resolved_image_url || item.image_url) ? (
                  <CmsMedia
                    key={item.id}
                    url={item.resolved_image_url ?? item.image_url ?? ''}
                    alt={itemLabel(item) || 'Palmonas'}
                    className="mt-6 h-10 w-auto object-contain"
                  />
                ) : item.item_type === 'link' ? (
                  <div key={item.id} className="mt-4">
                    <FooterLinkText item={item} />
                  </div>
                ) : null,
              )}
            </div>
            <FooterColumnsBlock columns={columns} />
          </div>

          {config.show_social_row !== false && rootSocial.length > 0 ? (
            <FooterSocialBlock items={rootSocial} />
          ) : null}

          {config.show_app_download !== false
            ? appDownloads.map((item) => (
                <FooterAppDownloadBlock key={item.id} item={item} config={config} />
              ))
            : null}

          {config.show_trust_badges !== false
            ? imageRows.map((item) => <FooterImageRowBlock key={item.id} item={item} />)
            : null}

          {config.annual_returns_text ? (
            <p className="mt-3 text-center text-xs leading-5 text-[var(--footer-text)]">
              {config.annual_returns_text}
            </p>
          ) : null}
        </div>
      ) : null}

      {config.show_popular_searches !== false && linkGroups.length > 0 ? (
        <FooterLinkGroupsBlock groups={linkGroups} heading={config.popular_searches_heading} />
      ) : null}
    </footer>
  );
}
