import { POP_HERO } from '@/config/pop/pop.config';

export function PopHeroSection() {
  return (
    <section
      className="rounded-2xl bg-gradient-to-br from-[#F8F0FA] to-white p-5"
      aria-label="Plan overview"
    >
      <p className="text-2xl font-bold text-[#7D3C98]">{POP_HERO.title}</p>
      <p className="mt-2 text-sm leading-6 font-normal text-[#757575]">{POP_HERO.subtitle}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {POP_HERO.highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#EFEFEF] bg-white px-2 py-3 text-center"
          >
            <p className="text-xs font-bold text-[#151515]">{item.label}</p>
            <p className="mt-1 text-[10px] font-normal text-[#757575]">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
