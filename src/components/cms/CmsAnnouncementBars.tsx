'use client';

import { RotatingAnnouncementBar } from '@/components/layout/RotatingAnnouncementBar';
import type { AnnouncementBarItem } from '@/config/layout/announcement-bar.config';
import type { CmsAnnouncementBarViewModel } from '@/lib/utils/cms-page-layouts';
import { cn } from '@/lib/utils/cn';
import { resolveLayoutItemHref } from '@/lib/utils/header';

interface CmsAnnouncementBarsProps {
  bars: CmsAnnouncementBarViewModel[];
  className?: string;
}

function announcementBarLabel(bar: CmsAnnouncementBarViewModel): string {
  const firstLabel = bar.items[0]?.label ?? bar.items[0]?.title ?? bar.items[0]?.name;

  return typeof firstLabel === 'string' && firstLabel.trim().length > 0
    ? firstLabel.trim()
    : 'Announcement';
}

/**
 * Maps CMS announcement items into rotating slides.
 *
 * @param bar - CMS announcement bar view model.
 */
function mapCmsAnnouncementItems(bar: CmsAnnouncementBarViewModel): AnnouncementBarItem[] {
  const slides: AnnouncementBarItem[] = [];

  for (const item of bar.items) {
    const label = item.label ?? item.title ?? item.name ?? '';
    if (!label.trim()) {
      continue;
    }

    const href = resolveLayoutItemHref(item);
    slides.push({
      id: item.id,
      text: label,
      route: href ?? '',
      external: Boolean(href?.startsWith('http')),
    });
  }

  return slides;
}

/**
 * Renders CMS page-shell announcement bar layouts above the site header.
 */
export function CmsAnnouncementBars({ bars, className }: CmsAnnouncementBarsProps) {
  if (bars.length === 0) {
    return null;
  }

  return (
    <>
      {bars.map((bar) => {
        const backgroundColor =
          typeof bar.config.background_color === 'string' ? bar.config.background_color : '#000000';
        const textColor =
          typeof bar.config.text_color === 'string' ? bar.config.text_color : '#ffffff';

        return (
          <RotatingAnnouncementBar
            key={bar.id}
            items={mapCmsAnnouncementItems(bar)}
            className={cn('px-4 py-1.5 text-sm font-medium', className)}
            style={{ backgroundColor, color: textColor }}
            regionLabel={announcementBarLabel(bar)}
            linkClassName="underline-offset-2 hover:underline"
          />
        );
      })}
    </>
  );
}
