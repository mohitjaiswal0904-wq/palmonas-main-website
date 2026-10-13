'use client';

/* eslint-disable @next/next/no-img-element -- CMS media uses arbitrary CDN URLs */

import { CmsCategoryTile } from '@/components/cms/shared/CmsCategoryTile';
import { AppLink } from '@/components/ui/AppLink';
import { useCmsAction } from '@/hooks/useCmsAction';
import { cn } from '@/lib/utils/cn';
import type { CmsSectionButton } from '@/types/cms-section';

const VARIANT_CLASSES: Record<string, string> = {
  'primary': 'bg-stone-900 text-white hover:bg-stone-800',
  'secondary': 'bg-stone-100 text-stone-900 hover:bg-stone-200',
  'outline': 'border border-stone-900 text-stone-900 hover:bg-stone-50',
  'ghost': 'text-stone-900 hover:bg-stone-100',
  'link': 'text-amber-700 underline-offset-4 hover:underline',
  'pill': 'rounded-full bg-stone-900 px-5 py-2 text-white hover:bg-stone-800',
  'icon-only': 'p-0',
  'full-width': 'w-full',
};

interface CmsButtonProps {
  button: CmsSectionButton;
  className?: string;
}

export function shouldUseCategoryTileButton(button: CmsSectionButton): boolean {
  return button.variant === 'category-tile';
}

export function CmsButton({ button, className }: CmsButtonProps) {
  const runAction = useCmsAction();
  const variant = button.variant ?? 'primary';
  const isIconOnly = variant === 'icon-only';

  if (variant === 'category-tile') {
    return (
      <CmsCategoryTile
        label={button.text ?? 'Shop'}
        imageUrl={button.image_url}
        onClick={() => runAction(button)}
        className={className}
      />
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex cursor-pointer items-center justify-center text-sm font-medium transition-colors',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        className,
      )}
      style={{
        backgroundColor: button.background_color,
        color: button.text_color,
      }}
      onClick={() => runAction(button)}
      aria-label={button.text ?? 'CMS action'}
    >
      {button.image_url ? (
        <img
          src={button.image_url}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(
            isIconOnly
              ? 'h-20 w-20 object-cover'
              : 'tab:h-[20vw] tab:w-[20vw] laptop:h-[12vw] laptop:w-[12vw] object-contain',
          )}
        />
      ) : null}
      {isIconOnly ? null : button.text}
    </button>
  );
}

interface CmsCtaLinkProps {
  text: string;
  link: string;
  className?: string;
}

export function CmsCtaLink({ text, link, className }: CmsCtaLinkProps) {
  const runAction = useCmsAction();

  if (link.startsWith('http')) {
    return (
      <button
        type="button"
        className={cn(
          'cursor-pointer text-sm font-medium text-amber-700 hover:underline',
          className,
        )}
        onClick={() => runAction({ action_type: 'external', action_value: link })}
      >
        {text}
      </button>
    );
  }

  if (link.startsWith('/')) {
    return (
      <AppLink
        href={link}
        className={cn('text-sm font-medium text-amber-700 hover:underline', className)}
      >
        {text}
      </AppLink>
    );
  }

  return (
    <button
      type="button"
      className={cn('cursor-pointer text-sm font-medium text-amber-700 hover:underline', className)}
      onClick={() => runAction({ action_type: 'navigate', action_value: link })}
    >
      {text}
    </button>
  );
}
