import { SearchMostLovedSection } from '@/components/search/SearchMostLovedSection';
import { searchMessages } from '@/config/search/search.config';

interface SearchEmptyStateProps {
  query: string;
}

/**
 * Search no-results state — title, subtitle, and Most Loved rail (Figma 2704:55554).
 */
export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center" data-testid="search-empty-state">
      <div className="flex w-full max-w-[328px] flex-col items-center gap-3 py-[94px] text-center capitalize">
        <h2 className="text-[21.5px] leading-normal font-normal text-[#151515]">
          {searchMessages.labels.formatNoResultsTitle(query)}
        </h2>
        <p className="text-xs leading-normal font-normal text-[#A9A9A9]">
          {searchMessages.labels.noResultDescription}
        </p>
      </div>

      <div className="laptop:max-w-none w-full max-w-[328px]">
        <SearchMostLovedSection />
      </div>
    </div>
  );
}
