'use client';

/* eslint-disable @next/next/no-img-element -- Builder images use arbitrary CDN URLs */

import { createElement, type ReactNode } from 'react';

import { CmsButton } from '@/components/cms/shared/CmsButton';
import { SilentVideo } from '@/components/cms/shared/SilentVideo';
import { AppLink } from '@/components/ui/AppLink';
import { useCmsAction } from '@/hooks/useCmsAction';
import {
  builderTextContainsHtml,
  getBuilderResponsiveStyleText,
  resolveBuilderTextTag,
  resolveBuilderTextContent,
  sanitizeBuilderAssetUrl,
  toBuilderStyle,
} from '@/lib/utils/cms-builder';
import { sanitizeCmsHtml } from '@/lib/utils/sanitize-cms-html';
import type { CmsBuilderNode } from '@/types/cms-builder';
import type { CmsAction } from '@/types/cms-section';

interface CmsBuilderElementProps {
  node: CmsBuilderNode;
}

function renderBuilderChildren(node: CmsBuilderNode): ReactNode {
  return node.children.map((child) => <CmsBuilderElement key={child.id} node={child} />);
}

function renderBuilderResponsiveStyle(node: CmsBuilderNode): ReactNode {
  const cssText = getBuilderResponsiveStyleText(node.id, node.props?.className);

  if (!cssText) {
    return null;
  }

  return <style>{cssText}</style>;
}

function getBuilderAction(props: CmsBuilderNode['props']): CmsAction | null {
  const explicitActionType = props?.action_type;
  const explicitActionValue = props?.action_value;

  if (explicitActionType && explicitActionValue != null && explicitActionValue !== '') {
    return {
      action_type: explicitActionType,
      action_value: explicitActionValue,
    };
  }

  if (!props?.clickAction || props.clickActionValue == null || props.clickActionValue === '') {
    return null;
  }

  const actionTypeMap: Record<string, CmsAction['action_type']> = {
    navigate: 'navigate',
    open_page: 'navigate',
    open_url: 'external',
    open_product: 'product',
    open_collection: 'collection',
  };

  const normalizedActionType = actionTypeMap[props.clickAction] ?? props.clickAction;
  const normalizedActionValue =
    props.clickAction === 'call'
      ? `tel:${props.clickActionValue}`
      : props.clickAction === 'email'
        ? `mailto:${props.clickActionValue}`
        : props.clickActionValue;

  return {
    action_type: normalizedActionType,
    action_value: normalizedActionValue,
  };
}

function CmsBuilderLink({ node }: CmsBuilderElementProps) {
  const runAction = useCmsAction();
  const props = node.props;
  const href = props?.href;
  const label = props?.label ?? href ?? '';
  const className = props?.className;
  const style = toBuilderStyle(props);
  const action = getBuilderAction(props);
  const children = renderBuilderChildren(node);
  const responsiveStyle = renderBuilderResponsiveStyle(node);

  if (!href && !action) {
    return <>{children}</>;
  }

  if (action) {
    return (
      <>
        {responsiveStyle}
        <button
          type="button"
          className={className}
          style={style}
          onClick={() => runAction(action)}
          aria-label={label || 'CMS link action'}
          data-cms-builder-node={node.id}
        >
          {label}
          {children}
        </button>
      </>
    );
  }

  if (!href) {
    return <>{children}</>;
  }

  if (props?.target === '_blank' || href.startsWith('http')) {
    return (
      <>
        {responsiveStyle}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          style={style}
          data-cms-builder-node={node.id}
        >
          {label}
          {children}
        </a>
      </>
    );
  }

  if (href.startsWith('/')) {
    return (
      <>
        {responsiveStyle}
        <AppLink href={href} className={className} style={style} data-cms-builder-node={node.id}>
          {label}
          {children}
        </AppLink>
      </>
    );
  }

  return (
    <>
      {responsiveStyle}
      <button
        type="button"
        className={className}
        style={style}
        onClick={() => runAction({ action_type: 'navigate', action_value: href })}
        aria-label={label || 'CMS link action'}
        data-cms-builder-node={node.id}
      >
        {label}
        {children}
      </button>
    </>
  );
}

function CmsBuilderText({ node }: CmsBuilderElementProps) {
  const props = node.props;
  const content = resolveBuilderTextContent(props);
  const Tag = resolveBuilderTextTag(props?.tag);
  const className = props?.className;
  const style = toBuilderStyle(props);
  const children = renderBuilderChildren(node);
  const responsiveStyle = renderBuilderResponsiveStyle(node);

  if (!content && node.children.length === 0) {
    return null;
  }

  if (content && builderTextContainsHtml(content)) {
    return (
      <>
        {responsiveStyle}
        {createElement(
          Tag,
          {
            className,
            style,
            'data-cms-builder-node': node.id,
          },
          <span dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(content) }} />,
          children,
        )}
      </>
    );
  }

  return (
    <>
      {responsiveStyle}
      {createElement(
        Tag,
        { className, style, 'data-cms-builder-node': node.id },
        content || null,
        children,
      )}
    </>
  );
}

export function CmsBuilderElement({ node }: CmsBuilderElementProps) {
  const runAction = useCmsAction();
  const props = node.props;
  const className = props?.className;
  const style = toBuilderStyle(props);
  const children = renderBuilderChildren(node);
  const responsiveStyle = renderBuilderResponsiveStyle(node);

  switch (node.type) {
    case 'container': {
      const hasBackgroundImage = Boolean(props?.backgroundImage);
      const containerStyle =
        hasBackgroundImage && style?.height === undefined && style?.minHeight === undefined
          ? { ...style, minHeight: '200px' }
          : style;

      return (
        <>
          {responsiveStyle}
          <div className={className} style={containerStyle} data-cms-builder-node={node.id}>
            {children}
          </div>
        </>
      );
    }
    case 'text':
      return <CmsBuilderText node={node} />;
    case 'image': {
      const src = props?.src;
      const action = getBuilderAction(props);
      const href = props?.href;

      if (!src) {
        return <>{children}</>;
      }

      const image = (
        <img
          src={sanitizeBuilderAssetUrl(src)}
          alt={props?.alt ?? ''}
          loading="lazy"
          decoding="async"
          className={className}
          style={style}
          width={typeof props?.width === 'number' ? props.width : undefined}
          height={typeof props?.height === 'number' ? props.height : undefined}
        />
      );

      if (action) {
        return (
          <>
            {responsiveStyle}
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0"
              onClick={() => runAction(action)}
              aria-label={props?.alt ?? props?.label ?? 'CMS image action'}
              data-cms-builder-node={node.id}
            >
              {image}
            </button>
          </>
        );
      }

      if (href) {
        if (props?.target === '_blank' || href.startsWith('http')) {
          return (
            <>
              {responsiveStyle}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={props?.alt ?? ''}
                data-cms-builder-node={node.id}
              >
                {image}
              </a>
            </>
          );
        }

        if (href.startsWith('/')) {
          return (
            <>
              {responsiveStyle}
              <AppLink href={href} aria-label={props?.alt ?? ''} data-cms-builder-node={node.id}>
                {image}
              </AppLink>
            </>
          );
        }
      }

      return (
        <>
          {responsiveStyle}
          {image}
        </>
      );
    }
    case 'button':
      return (
        <>
          {responsiveStyle}
          <div data-cms-builder-node={node.id}>
            <CmsButton
              button={{
                text: props?.label ?? props?.text ?? props?.content,
                variant: props?.variant,
                action_type: getBuilderAction(props)?.action_type,
                action_value: getBuilderAction(props)?.action_value,
                background_color: props?.background_color,
                text_color: props?.text_color ?? props?.textColor,
              }}
              className={className}
            />
          </div>
        </>
      );
    case 'link':
      return <CmsBuilderLink node={node} />;
    case 'video': {
      const src = props?.src;

      if (!src) {
        return <>{children}</>;
      }

      return (
        <>
          {responsiveStyle}
          <SilentVideo
            src={src}
            poster={props?.poster}
            autoPlay={props?.autoplay !== false}
            loop={props?.autoplay !== false}
            controls={props?.autoplay === false}
            preload="none"
            className={className}
            style={style}
            data-cms-builder-node={node.id}
          />
        </>
      );
    }
    case 'spacer':
      return (
        <>
          {responsiveStyle}
          <div
            aria-hidden="true"
            className={className}
            style={{
              ...style,
              height:
                typeof props?.height === 'string' || typeof props?.height === 'number'
                  ? props.height
                  : '1rem',
            }}
            data-cms-builder-node={node.id}
          />
        </>
      );
    default:
      return <>{children}</>;
  }
}
