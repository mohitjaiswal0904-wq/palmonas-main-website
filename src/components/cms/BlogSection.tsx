import { CMS_SECTION_CLASS } from '@/components/cms/cms-section-layout';
import { getSectionBody } from '@/lib/utils/cms-section-content';
import type { CmsSection } from '@/types/cms';

interface BlogSectionProps {
  section?: CmsSection;
}

export function BlogSection({ section }: BlogSectionProps) {
  const body = section ? getSectionBody(section) : null;

  return (
    <section className={CMS_SECTION_CLASS}>
      <p className="tracking-palmonas-wider text-sm text-amber-700 uppercase">
        {section?.type ?? 'cms'}
      </p>
      <h2 className="font-display mt-2 text-3xl">{section?.title ?? 'Latest from the journal'}</h2>
      {body ? <p className="mt-3 max-w-2xl text-stone-600">{body}</p> : null}
    </section>
  );
}
