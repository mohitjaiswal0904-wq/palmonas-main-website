import {
  CareersSectionHeader,
  CareersSectionShell,
} from '@/components/careers/CareersSectionHeader';
import { careersAbout, careersStats } from '@/config/careers.config';

/** About Palmonas + team/store/customer stats. */
export function CareersAboutSection() {
  return (
    <CareersSectionShell aria-labelledby="careers-about-heading">
      <CareersSectionHeader
        badge={careersAbout.badge}
        heading={careersAbout.heading}
        description={careersAbout.description}
        headingId="careers-about-heading"
        descriptionClassName="mb-4 tab:mb-5"
      />

      <div className="tab:gap-4 grid grid-cols-3 gap-2" role="list">
        {careersStats.map((stat) => (
          <article
            key={stat.label}
            role="listitem"
            className="tab:rounded-2xl tab:px-5 tab:py-5 rounded-xl border border-[#e8e8e8] bg-white px-2 py-3 text-center"
          >
            <p className="font-nunito-sans tab:mb-2 tab:text-[36px] text-[clamp(18px,4vw,24px)] leading-tight font-bold text-[#5c2c2c]">
              {stat.value}
            </p>
            <div
              className="tab:my-2 mx-auto my-2 h-px max-w-full bg-[#e5e7eb]"
              aria-hidden="true"
            />
            <p className="font-nunito-sans tab:text-sm tab:leading-normal text-xs leading-tight font-medium text-[#6b7280]">
              {stat.label}
            </p>
          </article>
        ))}
      </div>
    </CareersSectionShell>
  );
}
