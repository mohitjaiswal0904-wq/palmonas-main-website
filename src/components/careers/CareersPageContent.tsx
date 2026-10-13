import { CareersAboutSection } from '@/components/careers/CareersAboutSection';
import { CareersGeneralApplicationForm } from '@/components/careers/CareersGeneralApplicationForm';
import { CareersHeroBanner } from '@/components/careers/CareersHeroBanner';
import { CareersOpeningsSection } from '@/components/careers/CareersOpeningsSection';
import { CareersWhyJoinSection } from '@/components/careers/CareersWhyJoinSection';

/** Full Careers page composition matching the Figma / live careers layout. */
export function CareersPageContent() {
  return (
    <main className="bg-white">
      <CareersHeroBanner />
      <CareersAboutSection />
      <CareersWhyJoinSection />
      <CareersOpeningsSection />
      <CareersGeneralApplicationForm />
    </main>
  );
}
