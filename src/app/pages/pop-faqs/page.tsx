import { FaqsPageContent } from '@/components/faqs/FaqsPageContent';
import { MainContentSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { faqsMessages } from '@/config/faqs/faqs.config';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: faqsMessages.metaTitle,
  path: '/pages/pop-faqs',
  description: faqsMessages.metaDescription,
});

/** POP Plan FAQ and T&C (formerly at `/pages/faqs#terms`). */
export default function PopFaqsPage() {
  return (
    <StreamingPageShell mainFallback={<MainContentSkeleton ariaLabel="Loading page" />}>
      <main>
        <FaqsPageContent />
      </main>
    </StreamingPageShell>
  );
}
