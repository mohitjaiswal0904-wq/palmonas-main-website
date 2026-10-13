import { POP_BENEFITS } from '@/config/pop/pop.config';

export function PopBenefitsSection() {
  return (
    <section className="mt-8" aria-labelledby="pop-benefits-heading">
      <h2 id="pop-benefits-heading" className="text-base font-bold text-[#151515]">
        Why Choose Saving Plan?
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {POP_BENEFITS.map((benefit) => (
          <article key={benefit.title} className="rounded-2xl border border-[#EFEFEF] bg-white p-4">
            <h3 className="text-sm font-bold text-[#151515]">{benefit.title}</h3>
            <p className="mt-1 text-xs leading-5 font-normal text-[#757575]">
              {benefit.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
