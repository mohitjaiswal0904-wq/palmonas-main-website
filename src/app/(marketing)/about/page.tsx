import { AboutPageContent } from '@/components/about';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'About Us',
  path: '/about',
  description:
    'Learn about Palmonas — our story, mission, Shraddha Kapoor partnership, and commitment to Demifine® jewellery.',
});

export default function AboutPage() {
  return <AboutPageContent />;
}
