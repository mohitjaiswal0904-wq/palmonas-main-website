import type { CSSProperties, ReactNode } from 'react';

/* eslint-disable @next/next/no-img-element -- CMS rich text may embed remote images */

import { SilentVideo } from '@/components/cms/shared/SilentVideo';
import type { CmsRichTextBlock } from '@/types/cms-section';

function toStyleObject(
  styles: Record<string, string | number> | undefined,
): CSSProperties | undefined {
  if (!styles) {
    return undefined;
  }

  const style: Record<string, string | number> = {};

  Object.entries(styles).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      style[key] = value;
    }
  });

  return Object.keys(style).length > 0 ? style : undefined;
}

function renderRichTextBlock(block: CmsRichTextBlock, index: number): ReactNode {
  const blockType = block.type ?? 'html';
  const tag = block.tag ?? blockType;

  if (blockType === 'text' || tag === 'span') {
    return (
      <span key={index} style={toStyleObject(block.styles ?? block.style)}>
        {block.text ?? block.content}
      </span>
    );
  }

  if (tag === 'br' || blockType === 'break') {
    return <br key={index} />;
  }

  if (tag === 'img' || blockType === 'image') {
    const src = block.src ?? block.url;

    if (!src) {
      return null;
    }

    return (
      <img
        key={index}
        src={src}
        alt={block.alt ?? ''}
        style={toStyleObject(block.styles ?? block.style)}
        className="h-auto max-w-full"
      />
    );
  }

  if (blockType === 'video' || tag === 'video') {
    const src = block.src ?? block.url;

    if (!src) {
      return null;
    }

    return <SilentVideo key={index} src={src} controls className="h-auto max-w-full" />;
  }

  if (blockType === 'link' || tag === 'a') {
    const href = block.linkUrl ?? block.url;

    if (!href) {
      return null;
    }

    return (
      <a
        key={index}
        href={href}
        style={toStyleObject(block.styles ?? block.style)}
        className="text-amber-700 underline"
      >
        {block.linkText ?? block.text ?? block.content ?? href}
      </a>
    );
  }

  return (
    <span key={index} style={toStyleObject(block.styles ?? block.style)}>
      {block.content ?? block.text}
    </span>
  );
}

export function renderCmsRichText(blocks: CmsRichTextBlock[]): ReactNode[] {
  return blocks.map((block, index) => renderRichTextBlock(block, index));
}
