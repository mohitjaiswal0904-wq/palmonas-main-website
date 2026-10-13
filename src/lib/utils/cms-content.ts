import type { CmsSection } from '@/types/cms';
import type { CmsSectionButton, CmsSectionCard } from '@/types/cms-section';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getSectionContentRecord(section: CmsSection): Record<string, unknown> {
  return isRecord(section.content) ? section.content : {};
}

/**
 * Title-case each whitespace-separated word for CMS section headers.
 *
 * @param value - Raw CMS heading text (often ALL CAPS from the API)
 * @returns Words with only the first letter uppercased
 */
export function toCmsSectionTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLocaleLowerCase('en-IN');
      return `${lower.charAt(0).toLocaleUpperCase('en-IN')}${lower.slice(1)}`;
    })
    .join(' ');
}

export function getSectionDisplayTitle(section: CmsSection, fallback = ''): string {
  if (section.title?.trim()) {
    return toCmsSectionTitleCase(section.title);
  }

  return fallback ? toCmsSectionTitleCase(fallback) : fallback;
}

export function getVisibleButtons(content: Record<string, unknown>): CmsSectionButton[] {
  const buttons = content.buttons;

  if (!Array.isArray(buttons)) {
    return [];
  }

  return buttons
    .filter((button): button is CmsSectionButton => isRecord(button))
    .filter((button) => button.is_visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getVisibleCards(content: Record<string, unknown>): CmsSectionCard[] {
  const cards = content.cards;

  if (!Array.isArray(cards)) {
    return [];
  }

  return cards
    .filter((card): card is CmsSectionCard => isRecord(card))
    .filter((card) => card.is_visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getSectionCta(
  content: Record<string, unknown>,
): { text: string; link: string } | null {
  const cta = content.cta;

  if (!isRecord(cta)) {
    return null;
  }

  const text = typeof cta.text === 'string' ? cta.text : '';
  const link = typeof cta.link === 'string' ? cta.link : '';

  if (!text || !link) {
    return null;
  }

  return { text, link };
}

export function getCardGridColumns(content: Record<string, unknown>, fallback = 2): number {
  const columns = content.card_columns ?? content.columns;

  return typeof columns === 'number' && columns > 0 ? columns : fallback;
}

export function getButtonGridColumns(content: Record<string, unknown>, fallback = 2): number {
  const columns = content.columns;

  return typeof columns === 'number' && columns > 0 ? columns : fallback;
}

export function getCardGridTailwindClasses(
  content: Record<string, unknown>,
): Record<string, string> {
  const tailwind = content.grid_tailwind_class_names ?? content.card_grid_tailwind_class_names;

  return isRecord(tailwind)
    ? Object.fromEntries(
        Object.entries(tailwind).filter((entry): entry is [string, string] => {
          return typeof entry[1] === 'string';
        }),
      )
    : {};
}
