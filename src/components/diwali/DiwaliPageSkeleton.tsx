import {
  DIWALI_HERO_FRAME_CLASS,
  DIWALI_PAGE_ROOT_CLASS,
} from '@/components/diwali/diwali-constants';
import { diwaliMessages } from '@/config/diwali/diwali.config';

/**
 * Placeholder while the Diwali landing page streams in.
 */
export function DiwaliPageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label={diwaliMessages.a11y.loading}
      className={DIWALI_PAGE_ROOT_CLASS}
    >
      <div className="h-9 animate-pulse bg-[#4A1020]" />
      <div className={`${DIWALI_HERO_FRAME_CLASS} animate-pulse`} />
      <div className="tab:px-6 mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
        <div className="h-40 animate-pulse bg-[#EFEBE6]" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-48 animate-pulse bg-[#EFEBE6]" />
          <div className="h-48 animate-pulse bg-stone-200" />
        </div>
        <div className="h-64 animate-pulse bg-stone-100" />
      </div>
    </main>
  );
}
