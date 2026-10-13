import { CmsBuilderElement } from '@/components/cms/builder/CmsBuilderElement';
import { CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import { getBuilderElements } from '@/lib/utils/cms-builder';
import { getSectionContentRecord } from '@/lib/utils/cms-content';
import type { CmsSection } from '@/types/cms';

interface CustomComponentSectionProps {
  section: CmsSection;
}

export function CustomComponentSection({ section }: CustomComponentSectionProps) {
  const content = getSectionContentRecord(section);
  const elements = getBuilderElements(content);

  if (elements.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      <div className="cms-builder-root w-full">
        {elements.map((element) => (
          <CmsBuilderElement key={element.id} node={element} />
        ))}
      </div>
    </CmsSectionShell>
  );
}
