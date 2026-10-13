import { CmsEmbeddedExtras } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsSectionHeader, CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import { getSectionContentRecord, getSectionDisplayTitle } from '@/lib/utils/cms-content';
import { renderCmsRichText } from '@/lib/utils/cms-rich-text';
import { sanitizeCmsHtml } from '@/lib/utils/sanitize-cms-html';
import type { CmsSection } from '@/types/cms';
import type { CmsRichTextBlock } from '@/types/cms-section';

interface ParagraphSectionProps {
  section: CmsSection;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getHeaderAlignmentClass(alignment: unknown): string {
  if (alignment === 'right') {
    return 'tab:text-right';
  }

  if (alignment === 'left') {
    return 'tab:text-left';
  }

  return '';
}

function getAlignmentClass(alignment: unknown): string {
  if (alignment === 'center') {
    return 'text-center';
  }

  if (alignment === 'right') {
    return 'text-right';
  }

  return 'text-left';
}

function getTransformedBlocks(content: Record<string, unknown>): CmsRichTextBlock[] {
  const blocks = content.transformedContent;

  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks.filter((block): block is CmsRichTextBlock => isRecord(block));
}

function getSectionStyle(content: Record<string, unknown>): Record<string, string> | undefined {
  const style = content.transformedSectionStyle;

  if (!isRecord(style)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(style).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );
}

export function ParagraphSection({ section }: ParagraphSectionProps) {
  const content = getSectionContentRecord(section);
  const title = getSectionDisplayTitle(section);
  const alignmentClass = getAlignmentClass(content.alignment);
  const headerAlignmentClass = getHeaderAlignmentClass(content.alignment);
  const hasRichText = content.hasRichText === true;
  const transformedBlocks = getTransformedBlocks(content);
  const sectionStyle = getSectionStyle(content);
  const html =
    typeof content.html === 'string'
      ? content.html
      : typeof content.text === 'string'
        ? content.text
        : null;

  if (!html && transformedBlocks.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      <CmsSectionHeader title={title} className={headerAlignmentClass} />
      <div className={`prose w-full text-stone-700 ${alignmentClass}`} style={sectionStyle}>
        {hasRichText && transformedBlocks.length > 0 ? (
          renderCmsRichText(transformedBlocks)
        ) : html ? (
          <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(html) }} />
        ) : null}
      </div>
      <CmsEmbeddedExtras content={content} />
    </CmsSectionShell>
  );
}
