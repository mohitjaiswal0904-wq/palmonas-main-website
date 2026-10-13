import { CareersPageContent } from '@/components/careers';
import { Footer, Header } from '@/components/layout';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Careers',
  path: '/careers',
  description:
    'Join Palmonas — explore open roles across retail, creative, tech, marketing, and finance, or submit a general application.',
});

export default function CareersPage() {
  return (
    <>
      <Header />
      <CareersPageContent />
      <Footer />
    </>
  );
}
