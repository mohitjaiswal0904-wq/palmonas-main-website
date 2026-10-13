import { MediaSectionMedia } from '@/components/cms/MediaSectionMedia';
import { CmsCtaLink } from '@/components/cms/shared/CmsButton';
import { CmsEmbeddedExtras } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import {
  getSectionContentRecord,
  getSectionCta,
  getSectionDisplayTitle,
} from '@/lib/utils/cms-content';
import { getSectionMediaContent } from '@/lib/utils/cms-section-content';
import type { CmsSection } from '@/types/cms';

interface MediaSectionProps {
  section: CmsSection;
}

export function MediaSection({ section }: MediaSectionProps) {
  const content = getSectionContentRecord(section);
  const media = getSectionMediaContent(section);
  const title = getSectionDisplayTitle(section);
  const cta = getSectionCta(content);

  if (!media) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      <MediaSectionMedia
        url={media.mediaUrl}
        mediaType={media.mediaType}
        alt={media.alt}
        controls={false}
        sources={media.sources}
        aspectRatio={media.aspectRatio}
        poster={media.thumbnailUrl}
      />
      {title ? <p className="font-medium text-stone-900">{title}</p> : null}
      {cta ? <CmsCtaLink text={cta.text} link={cta.link} className="inline-block" /> : null}
      <CmsEmbeddedExtras content={content} />
    </CmsSectionShell>
  );
}
