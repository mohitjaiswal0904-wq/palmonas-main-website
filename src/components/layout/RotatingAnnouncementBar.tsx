'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';

import {
  announcementBarMessages,
  announcementBarRotationIntervalMs,
  announcementBarSlideDurationMs,
  type AnnouncementBarItem,
} from '@/config/layout/announcement-bar.config';
import { cn } from '@/lib/utils/cn';

interface AnnouncementSlideProps {
  item: AnnouncementBarItem;
  linkClassName?: string;
}

/** Renders one announcement slide as an internal route or external link. */
function AnnouncementSlide({ item, linkClassName }: AnnouncementSlideProps) {
  const className = cn('block w-full shrink-0 text-center', linkClassName);

  if (!item.route) {
    return <span className={className}>{item.text}</span>;
  }

  if (item.external) {
    return (
      <a href={item.route} className={className} target="_blank" rel="noopener noreferrer">
        {item.text}
      </a>
    );
  }

  return (
    <Link href={item.route} className={className}>
      {item.text}
    </Link>
  );
}

interface RotatingAnnouncementBarProps {
  items: AnnouncementBarItem[];
  className?: string;
  style?: CSSProperties;
  regionLabel?: string;
  linkClassName?: string;
}

/**
 * Builds a stable key so rotation state resets when slide content changes.
 *
 * @param items - Announcement slides in display order.
 */
function buildAnnouncementItemsKey(items: AnnouncementBarItem[]): string {
  return items.map((item) => item.id).join('|');
}

interface RotatingAnnouncementTrackProps {
  items: AnnouncementBarItem[];
  linkClassName?: string;
}

/** Rotating slide track — remounted when `items` identity changes. */
function RotatingAnnouncementTrack({ items, linkClassName }: RotatingAnnouncementTrackProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemCount = items.length;

  useEffect(() => {
    if (itemCount <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % itemCount);
    }, announcementBarRotationIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [itemCount]);

  return (
    <div className="overflow-hidden" aria-live="polite">
      <div
        className="flex transition-transform ease-in-out motion-reduce:transition-none"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
          transitionDuration: `${announcementBarSlideDurationMs}ms`,
        }}
      >
        {items.map((item) => (
          <AnnouncementSlide key={item.id} item={item} linkClassName={linkClassName} />
        ))}
      </div>
    </div>
  );
}

/**
 * Horizontally rotating announcement bar track shared by default and CMS bars.
 */
export function RotatingAnnouncementBar({
  items,
  className,
  style,
  regionLabel = announcementBarMessages.a11y.regionLabel,
  linkClassName,
}: RotatingAnnouncementBarProps) {
  const itemCount = items.length;

  if (itemCount === 0) {
    return null;
  }

  if (itemCount === 1) {
    const item = items[0];
    if (!item) {
      return null;
    }

    return (
      <div className={className} style={style} role="region" aria-label={regionLabel}>
        <AnnouncementSlide item={item} linkClassName={linkClassName} />
      </div>
    );
  }

  return (
    <div className={className} style={style} role="region" aria-label={regionLabel}>
      <RotatingAnnouncementTrack
        key={buildAnnouncementItemsKey(items)}
        items={items}
        linkClassName={linkClassName}
      />
    </div>
  );
}
