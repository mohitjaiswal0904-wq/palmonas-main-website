import { Heart, Sparkles, TrendingUp, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  CareersSectionHeader,
  CareersSectionShell,
} from '@/components/careers/CareersSectionHeader';
import { careersBenefits, careersWhyJoin, type CareerBenefit } from '@/config/careers.config';

const BENEFIT_ICONS: Record<CareerBenefit['icon'], LucideIcon> = {
  sparkles: Sparkles,
  growth: TrendingUp,
  wellness: Heart,
  inclusive: Users,
};

/** Why-join-us benefit cards grid. */
export function CareersWhyJoinSection() {
  return (
    <CareersSectionShell className="tab:py-6" aria-labelledby="careers-why-heading">
      <CareersSectionHeader
        badge={careersWhyJoin.badge}
        heading={careersWhyJoin.heading}
        description={careersWhyJoin.description}
        headingId="careers-why-heading"
        descriptionClassName="mx-auto mb-4 max-w-[340px]"
      />

      <div className="tab:gap-4 grid grid-cols-2 gap-3" role="list">
        {careersBenefits.map((benefit) => {
          const Icon = BENEFIT_ICONS[benefit.icon];

          return (
            <article
              key={benefit.id}
              role="listitem"
              className="tab:px-4 tab:py-4 rounded-2xl bg-[#f9fafb] px-3 py-3 text-left"
            >
              <div
                className="mb-2 flex size-10 items-center justify-center rounded-lg bg-[#f2eae5] text-[#6b2c2c]"
                aria-hidden="true"
              >
                <Icon className="size-5" strokeWidth={2} />
              </div>
              <h3 className="font-nunito-sans tab:text-lg mb-1 text-base leading-tight font-bold text-[#101828]">
                {benefit.title}
              </h3>
              <p className="font-nunito-sans tab:text-sm text-xs leading-relaxed font-normal text-[#6b7280]">
                {benefit.description}
              </p>
            </article>
          );
        })}
      </div>
    </CareersSectionShell>
  );
}
