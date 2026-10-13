'use client';

import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react';

import { CmsResponsiveStyle } from '@/components/cms/shared/CmsResponsiveStyle';
import { toBuilderStyle } from '@/lib/utils/cms-builder';
import { cn } from '@/lib/utils/cn';

type CmsRuntimeClassSlotProps = {
  nodeId: string;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>;

/**
 * Apply CMS-authored Tailwind utility strings at runtime.
 * Base utilities become inline styles; `tab:` / `laptop:` / etc. inject via media-query CSS.
 */
export function CmsRuntimeClassSlot({
  nodeId,
  className,
  as: Component = 'div',
  style,
  children,
  ...rest
}: CmsRuntimeClassSlotProps) {
  const runtimeStyle = toBuilderStyle({ className });
  // Runtime class styles win over caller styles for shared props (e.g. avoid
  // forced `width: 100%` overriding `tab:w-*` / `laptop:w-*` media CSS).
  const mergedStyle =
    runtimeStyle || style
      ? {
          ...(style ?? {}),
          ...(runtimeStyle ?? {}),
        }
      : undefined;

  const elementProps: Record<string, unknown> = {
    ...rest,
    'className': cn(className),
    'style': mergedStyle,
    'data-cms-style-node': nodeId,
  };

  if (Component === 'button' && elementProps.type == null) {
    elementProps.type = 'button';
  }

  return (
    <>
      <CmsResponsiveStyle nodeId={nodeId} className={className} />
      {createElement(Component, elementProps, children)}
    </>
  );
}
