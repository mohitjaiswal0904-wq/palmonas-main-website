import { getBuilderResponsiveStyleText } from '@/lib/utils/cms-builder';

interface CmsResponsiveStyleProps {
  nodeId: string;
  className?: string;
}

/** Injects runtime media-query CSS for CMS-authored responsive utility classes. */
export function CmsResponsiveStyle({ nodeId, className }: CmsResponsiveStyleProps) {
  const cssText = getBuilderResponsiveStyleText(nodeId, className, 'data-cms-style-node');

  if (!cssText) {
    return null;
  }

  return <style>{cssText}</style>;
}
