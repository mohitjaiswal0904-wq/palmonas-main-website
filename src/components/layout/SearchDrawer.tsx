import { Input } from '@/components/ui/Input';

export function SearchDrawer() {
  return (
    <aside
      className="rounded-palmonas-lg border border-stone-200 bg-white p-6"
      aria-label="Search drawer"
    >
      <h2 className="font-display text-2xl">Search Palmonas</h2>
      <form action="/search" className="mt-4 flex gap-3">
        <Input name="q" placeholder="Search jewelry" aria-label="Search query" />
        <button
          type="submit"
          className="rounded-palmonas-md bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          aria-label="Submit search"
        >
          Search
        </button>
      </form>
    </aside>
  );
}
