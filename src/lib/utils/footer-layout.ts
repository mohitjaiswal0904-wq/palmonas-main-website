import type { LayoutItem } from '@/types/layout';

export function itemLabel(item: LayoutItem): string {
  return item.label ?? item.title ?? item.name ?? '';
}

/** Returns the CMS `label` for footer link_group row headers. */
export function resolveLinkGroupLabel(item: LayoutItem): string {
  return typeof item.label === 'string' ? item.label.trim() : '';
}

/** Sort key for nested footer link_group children (`stack_order` then `sort_order`). */
export function linkGroupChildOrder(item: LayoutItem): number {
  return item.stack_order ?? item.sort_order ?? 0;
}

function sortByStackOrder(items: LayoutItem[]): LayoutItem[] {
  return [...items].sort((a, b) => (a.stack_order ?? 0) - (b.stack_order ?? 0));
}

/** Flattens nested CMS items (API may return pre-nested `children` arrays). */
export function flattenLayoutItems(items: LayoutItem[]): LayoutItem[] {
  const flat: LayoutItem[] = [];
  const seen = new Set<string>();

  function walk(item: LayoutItem): void {
    if (seen.has(item.id)) {
      return;
    }

    seen.add(item.id);

    const { children, ...rest } = item;
    flat.push(rest);

    if (children?.length) {
      for (const child of children) {
        walk(child);
      }
    }
  }

  for (const item of items) {
    walk(item);
  }

  return flat;
}

export function buildItemTree(items: LayoutItem[]): LayoutItem[] {
  const flatItems = flattenLayoutItems(items);
  const nodes = new Map<string, LayoutItem>();

  for (const item of flatItems) {
    nodes.set(item.id, { ...item, children: [] });
  }

  const roots: LayoutItem[] = [];

  for (const item of flatItems) {
    const node = nodes.get(item.id);
    if (!node) {
      continue;
    }

    if (item.parent_id && nodes.has(item.parent_id)) {
      const parent = nodes.get(item.parent_id);
      parent?.children?.push(node);
    } else if (!item.parent_id) {
      roots.push(node);
    }
  }

  const sortTree = (list: LayoutItem[]): LayoutItem[] =>
    sortByStackOrder(list).map((item) => ({
      ...item,
      children: item.children ? sortTree(item.children) : [],
    }));

  return sortTree(roots);
}
