import type { ReactNode } from 'react';

import { DrawerImage } from '@/components/layout/drawer/DrawerImage';
import { getDrawerViewportImageCount } from '@/lib/drawer/drawer-image-prefetch';
import type { DrawerCategoryItem, DrawerPriceRange } from '@/types/drawer-menu';

interface DrawerCategoryGrid3Props {
  items: DrawerCategoryItem[];
  categoryId?: string;
  onItemPress: (item: DrawerCategoryItem) => void;
}

function formatLabel(label: string, categoryId?: string): string {
  if (categoryId === 'gender' && label.toLowerCase().includes('collection')) {
    const collectionIndex = label.toLowerCase().indexOf('collection');
    const beforeCollection = label.substring(0, collectionIndex).trim();
    const collectionPart = label.substring(collectionIndex).trim();
    return beforeCollection ? `${beforeCollection}\n${collectionPart}` : collectionPart;
  }

  return label;
}

export function DrawerCategoryGrid3({ items, categoryId, onItemPress }: DrawerCategoryGrid3Props) {
  const priorityCount = getDrawerViewportImageCount('grid-3');

  return (
    <div className="grid grid-cols-2 gap-2 px-3 pt-2">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className="mb-2 text-left"
          onClick={() => onItemPress(item)}
        >
          <div className="overflow-hidden rounded-[10px] bg-white p-3">
            <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100">
              <DrawerImage
                src={item.imageUrl}
                alt=""
                priority={index < priorityCount}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-2 text-center text-xs whitespace-pre-line text-black">
              {formatLabel(item.label, categoryId)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

interface Grid2CardProps {
  item: DrawerCategoryItem;
  textAlign: 'left' | 'center' | 'right';
  priority?: boolean;
  onPress: (item: DrawerCategoryItem) => void;
}

function Grid2Card({ item, textAlign, priority = false, onPress }: Grid2CardProps) {
  return (
    <button type="button" className="mb-3 w-[49%] text-left" onClick={() => onPress(item)}>
      <div className="overflow-hidden pb-1">
        <div className="mb-0 aspect-[1.2] w-full overflow-hidden bg-[#E5E7EB]">
          {item.imageUrl.trim() ? (
            <DrawerImage
              src={item.imageUrl}
              alt=""
              priority={priority}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="relative overflow-hidden p-1.5">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white to-transparent"
            aria-hidden="true"
          />
          <p className="relative text-[10px] text-[#1D278F]" style={{ textAlign }}>
            {item.label}
          </p>
        </div>
      </div>
    </button>
  );
}

function FullWidthBannerCard({ item, textAlign, priority = false, onPress }: Grid2CardProps) {
  return (
    <button type="button" className="mb-3 w-full text-left" onClick={() => onPress(item)}>
      <div className="overflow-hidden pb-1">
        <div className="mb-0 aspect-[2.5] w-full overflow-hidden bg-gray-100">
          {item.imageUrl.trim() ? (
            <DrawerImage
              src={item.imageUrl}
              alt=""
              priority={priority}
              sizes="(max-width: 768px) 90vw, 480px"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="relative overflow-hidden p-1">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white to-transparent"
            aria-hidden="true"
          />
          <p className="relative text-[10px] text-[#1D278F]" style={{ textAlign }}>
            {item.label}
          </p>
        </div>
      </div>
    </button>
  );
}

interface DrawerCategoryGrid2BannerProps {
  items: DrawerCategoryItem[];
  categoryId?: string;
  onItemPress: (item: DrawerCategoryItem) => void;
}

export function DrawerCategoryGrid2Banner({
  items,
  categoryId,
  onItemPress,
}: DrawerCategoryGrid2BannerProps) {
  const textAlign = categoryId === 'style' ? 'left' : 'center';
  const priorityCount = getDrawerViewportImageCount('grid-2-banner');
  const elements: ReactNode[] = [];
  let gridItems: { item: DrawerCategoryItem; index: number }[] = [];

  items.forEach((item, index) => {
    if (item.isFullWidth) {
      if (gridItems.length > 0) {
        elements.push(
          <div key={`grid-${index}`} className="flex flex-wrap justify-between">
            {gridItems.map(({ item: gridItem, index: itemIndex }) => (
              <Grid2Card
                key={gridItem.id}
                item={gridItem}
                textAlign={textAlign}
                priority={itemIndex < priorityCount}
                onPress={onItemPress}
              />
            ))}
          </div>,
        );
        gridItems = [];
      }

      elements.push(
        <FullWidthBannerCard
          key={item.id}
          item={item}
          textAlign={textAlign}
          priority={index < priorityCount}
          onPress={onItemPress}
        />,
      );
      return;
    }

    gridItems.push({ item, index });
  });

  if (gridItems.length > 0) {
    elements.push(
      <div key="grid-final" className="flex flex-wrap justify-between">
        {gridItems.map(({ item: gridItem, index: itemIndex }) => (
          <Grid2Card
            key={gridItem.id}
            item={gridItem}
            textAlign={textAlign}
            priority={itemIndex < priorityCount}
            onPress={onItemPress}
          />
        ))}
      </div>,
    );
  }

  return <div className="px-3 pt-4">{elements}</div>;
}

interface DrawerBannerListProps {
  items: DrawerCategoryItem[];
  onItemPress: (item: DrawerCategoryItem) => void;
}

export function DrawerBannerList({ items, onItemPress }: DrawerBannerListProps) {
  const priorityCount = getDrawerViewportImageCount('banner-list');

  return (
    <div className="px-3 pt-4">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className="mb-3 w-full text-left"
          onClick={() => onItemPress(item)}
        >
          <div className="overflow-hidden bg-white p-2">
            <div className="mb-1 h-20 w-full overflow-hidden rounded-lg bg-white">
              <DrawerImage
                src={item.imageUrl}
                alt=""
                priority={index < priorityCount}
                sizes="(max-width: 768px) 90vw, 480px"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-xs text-[#374151]">{item.label}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

interface DrawerPriceRangeListProps {
  priceRanges: DrawerPriceRange[];
  onPriceRangeChange: (handle: string, label: string) => void;
}

function PriceRowSmall({
  range,
  priority = false,
  onPress,
}: {
  range: DrawerPriceRange;
  priority?: boolean;
  onPress: (handle: string, label: string) => void;
}) {
  return (
    <button
      type="button"
      className="w-[calc(50%-0.21rem)] overflow-hidden text-left"
      onClick={() => {
        if (range.handle) {
          onPress(range.handle, range.label);
        }
      }}
    >
      <div className="aspect-[101/72] w-full overflow-hidden rounded-t-xl bg-[#E8E8E8]">
        {range.imageUrl ? (
          <DrawerImage
            src={range.imageUrl}
            alt=""
            priority={priority}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-neutral-200" />
        )}
      </div>
      <div className="flex min-h-[1.625rem] items-center justify-center rounded-b-xl bg-white px-0.5 py-1">
        <p className="text-center text-xs text-black capitalize">{range.label}</p>
      </div>
    </button>
  );
}

function PriceRowWide({
  range,
  priority = false,
  onPress,
}: {
  range: DrawerPriceRange;
  priority?: boolean;
  onPress: (handle: string, label: string) => void;
}) {
  return (
    <button
      type="button"
      className="mt-2 w-full overflow-hidden text-left"
      onClick={() => {
        if (range.handle) {
          onPress(range.handle, range.label);
        }
      }}
    >
      <div className="aspect-[210/79] w-full overflow-hidden rounded-t-lg bg-[#E8E8E8]">
        {range.imageUrl ? (
          <DrawerImage
            src={range.imageUrl}
            alt=""
            priority={priority}
            sizes="(max-width: 768px) 90vw, 480px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-neutral-200" />
        )}
      </div>
      <div className="flex min-h-[1.625rem] items-center justify-center rounded-b-lg bg-white px-0.5 py-1">
        <p className="text-center text-xs text-black capitalize">{range.label}</p>
      </div>
    </button>
  );
}

export function DrawerPriceRangeList({
  priceRanges,
  onPriceRangeChange,
}: DrawerPriceRangeListProps) {
  const priorityCount = getDrawerViewportImageCount('price-range');
  const wide = priceRanges.find((range) => range.isFullWidth);
  const firstRow = priceRanges.filter((range) => !range.isFullWidth);

  return (
    <div className="w-full px-3 pt-4 pb-1">
      <div className="flex flex-wrap gap-[0.42rem]">
        {firstRow.map((range, index) => (
          <PriceRowSmall
            key={range.id}
            range={range}
            priority={index < priorityCount}
            onPress={onPriceRangeChange}
          />
        ))}
      </div>
      {wide ? (
        <PriceRowWide
          range={wide}
          priority={firstRow.length < priorityCount}
          onPress={onPriceRangeChange}
        />
      ) : null}
    </div>
  );
}

export function DrawerViewAllLink({
  handle,
  onPress,
}: {
  handle: string;
  onPress: (handle: string) => void;
}) {
  return (
    <div className="flex justify-center pt-1">
      <button
        type="button"
        className="border-b border-black text-sm font-medium text-black"
        onClick={() => onPress(handle)}
      >
        View all
      </button>
    </div>
  );
}
