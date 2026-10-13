import { CmsSectionList } from '@/components/cms/CmsSectionList';
import type { CmsSection } from '@/types/cms';

interface DynamicSectionRendererProps {
  sections: CmsSection[];
}

/** @deprecated Use CmsSectionList */
export function DynamicSectionRenderer({ sections }: DynamicSectionRendererProps) {
  return <CmsSectionList sections={sections} />;
}
