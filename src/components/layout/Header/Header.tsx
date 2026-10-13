import { HeaderRenderer } from '@/components/layout/Header/components/HeaderRenderer';
import { getHeaderData } from '@/services/server/header.service.server';
import { getSearchSuggestions } from '@/services/server/search-suggestions.service.server';

export async function Header() {
  const [{ config, items, rows }, suggestions] = await Promise.all([
    getHeaderData(),
    getSearchSuggestions(),
  ]);

  return (
    <HeaderRenderer
      config={config}
      items={items}
      rows={rows}
      platform="web"
      suggestions={suggestions}
    />
  );
}
