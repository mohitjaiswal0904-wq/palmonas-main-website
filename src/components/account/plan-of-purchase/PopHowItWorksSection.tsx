import { POP_HOW_IT_WORKS } from '@/config/pop/pop.config';

export function PopHowItWorksSection() {
  return (
    <section className="mt-8" aria-labelledby="pop-how-it-works-heading">
      <h2 id="pop-how-it-works-heading" className="text-base font-bold text-[#151515]">
        How It Works
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {POP_HOW_IT_WORKS.map((step) => (
          <article key={step.step} className="rounded-2xl border border-[#EFEFEF] bg-white p-4">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F0FA] text-xs font-bold text-[#7D3C98]">
              {step.step}
            </span>
            <h3 className="mt-3 text-sm font-bold text-[#151515]">{step.title}</h3>
            <p className="mt-1 text-xs leading-5 font-normal text-[#757575]">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
