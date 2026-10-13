'use client';

import type { ReactNode } from 'react';

import { CMS_SECTION_CLASS } from '@/components/cms/cms-section-layout';
import { useCmsAction } from '@/hooks/useCmsAction';
import { toCmsSectionTitleCase } from '@/lib/utils/cms-content';
import { cn } from '@/lib/utils/cn';
import type { CmsSection } from '@/types/cms';

interface CmsSectionShellProps {
  section: CmsSection;
  className?: string;
  children: ReactNode;
}

/**
 * Returns whether a click/key target sits inside nested interactive content.
 * Product cards and tab buttons must keep their own navigation instead of the section action.
 */
function isNestedInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('a, button'));
}

export function CmsSectionShell({ section, className, children }: CmsSectionShellProps) {
  const runAction = useCmsAction();
  const hasSectionAction = Boolean(section.action && section.action_value);

  const content = (
    <section className={cn(CMS_SECTION_CLASS, className)}>
      <div className="flex w-full flex-col gap-3">{children}</div>
    </section>
  );

  if (!hasSectionAction) {
    return content;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="w-full cursor-pointer"
      onClick={(event) => {
        if (isNestedInteractiveTarget(event.target)) {
          return;
        }

        runAction({
          action_type: section.action,
          action_value: section.action_value,
        });
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }

        if (isNestedInteractiveTarget(event.target)) {
          return;
        }

        event.preventDefault();
        runAction({
          action_type: section.action,
          action_value: section.action_value,
        });
      }}
    >
      {content}
    </div>
  );
}

interface CmsSectionHeaderProps {
  title?: string;
  className?: string;
}

export function CmsSectionHeader({ title, className }: CmsSectionHeaderProps) {
  if (!title) {
    return null;
  }

  return (
    <h2
      className={cn(
        'tab:text-center tab:ml-0 tab:text-2xl tab:font-semibold ml-[2vw] text-left text-base font-[500] text-[#151515]',
        className,
      )}
    >
      {toCmsSectionTitleCase(title)}
    </h2>
  );
}
