import { ContactUsPageContent } from '@/components/contact';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Contact Us',
  path: '/contact-us',
  description:
    'Get in touch with Palmonas for customer support, careers, partnerships, corporate gifting, and press inquiries.',
});

export default function ContactUsPage() {
  return (
    <StreamingPageShell>
      <ContactUsPageContent />
    </StreamingPageShell>
  );
}
