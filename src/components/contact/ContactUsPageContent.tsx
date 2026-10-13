import { ContactOfficeSection } from '@/components/contact/ContactOfficeSection';
import { ContactSupportBar } from '@/components/contact/ContactSupportBar';
import { ContactTeamCard } from '@/components/contact/ContactTeamCard';
import { contactTeamSections } from '@/config/contact.config';

export function ContactUsPageContent() {
  return (
    <main className="bg-palmonas-surface">
      <section className="tab:py-12 laptop:py-16 container py-10">
        <div className="mx-auto flex max-w-[1136px] flex-col gap-10">
          <ContactSupportBar />

          <div className="flex flex-col items-center gap-6">
            <div className="max-w-[620px] text-center">
              <h1 className="font-nunito-sans text-2xl font-semibold text-[#1c1c1c]">
                Reach the Right Team
              </h1>
              <p className="font-nunito-sans mt-3 text-base leading-7 text-[#6c6c6c]">
                Whatever you&apos;re looking for — a career, a partnership, gifting, or a quick
                question — there&apos;s a dedicated team ready to help.
              </p>
            </div>

            <div className="tab:grid-cols-2 laptop:grid-cols-3 grid w-full max-w-[1200px] grid-cols-1 gap-6">
              {contactTeamSections.map((section) => (
                <ContactTeamCard key={section.title} section={section} />
              ))}
            </div>
          </div>

          <ContactOfficeSection />
        </div>
      </section>
    </main>
  );
}
