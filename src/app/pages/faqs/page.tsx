import { buildPolicyPageMetadata, StaticPolicyPage } from '@/components/policy/StaticPolicyPage';

export const metadata = buildPolicyPageMetadata('faqs')!;

/** Verbatim live `/pages/faqs` jewellery FAQ page. */
export default function FaqsPage() {
  return <StaticPolicyPage slug="faqs" />;
}
