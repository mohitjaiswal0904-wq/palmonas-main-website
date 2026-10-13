import Link from "next/link";
import { ChevronDownIcon } from "@/components/ui/icons";
import {
  homeSeoCategories,
  homeSeoClosing,
  homeSeoFaqs,
  homeSeoFeatures,
  homeSeoGifting,
  homeSeoIntro,
} from "@/data/homeSeoContent";

function SubtleDetails({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details className={`group ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-left marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="text-[13px] text-[#6b6b6b] transition-colors group-hover:text-[#444] group-open:text-[#444]">
          {label}
        </span>
        <ChevronDownIcon className="size-3 shrink-0 text-[#aaa] transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-4 text-[13px] leading-[1.7] text-[#868686]">
        {children}
      </div>
    </details>
  );
}

export default function HomeSeoContent() {
  return (
    <section
      aria-label="About Palmonas jewellery"
      className="border-t border-black/5 bg-white py-10 sm:py-12"
    >
      <div className="mx-auto w-full max-w-[720px] px-6">
        <h2 className="text-[13px] font-normal leading-relaxed text-[#868686]">
          {homeSeoIntro.headline}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#868686]">
          {homeSeoIntro.subheadline}. {homeSeoIntro.summary}
        </p>

        <div className="mt-6 divide-y divide-black/5">
          <SubtleDetails label="About Palmonas">
            <div className="space-y-3">
              {homeSeoIntro.expanded.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              <p className="pt-1 font-normal text-[#6b6b6b]">
                Our materials speak for themselves:
              </p>
              <ul className="list-inside list-disc space-y-1 pl-1">
                {homeSeoIntro.materials.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="italic">{homeSeoIntro.materialsNote}</p>
            </div>
          </SubtleDetails>

          <SubtleDetails label="Shop by category">
            <div className="space-y-5">
              {homeSeoCategories.map((category) => (
                <div key={category.title}>
                  <h3 className="mb-1.5 text-[13px] font-normal text-[#6b6b6b]">
                    <Link
                      href={category.href}
                      className="underline-offset-2 hover:underline"
                    >
                      {category.title}
                    </Link>
                  </h3>
                  {category.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="mt-1.5">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </SubtleDetails>

          <SubtleDetails label="What makes Palmonas different">
            <div className="space-y-4">
              {homeSeoFeatures.map((feature) => (
                <div key={feature.title}>
                  <h3 className="text-[13px] font-normal text-[#6b6b6b]">
                    {feature.title}
                  </h3>
                  <p className="mt-1">{feature.body}</p>
                </div>
              ))}
            </div>
          </SubtleDetails>

          <SubtleDetails label={homeSeoGifting.title}>
            <p>{homeSeoGifting.body}</p>
          </SubtleDetails>

          <SubtleDetails label="Frequently asked questions">
            <div className="divide-y divide-black/5">
              {homeSeoFaqs.map((faq) => (
                <details key={faq.question} className="group/faq py-2">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 py-1 text-left marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="text-[13px] text-[#6b6b6b] group-open/faq:text-[#444]">
                      {faq.question}
                    </span>
                    <ChevronDownIcon className="mt-0.5 size-3 shrink-0 text-[#ccc] transition-transform duration-200 group-open/faq:rotate-180" />
                  </summary>
                  <p className="pb-2 pt-1">{faq.answer}</p>
                </details>
              ))}
            </div>
          </SubtleDetails>
        </div>

        <p className="mt-6 text-[13px] leading-relaxed text-[#868686]">
          {homeSeoClosing.body}{" "}
          <Link
            href="/collection"
            className="text-[#6b6b6b] underline-offset-2 hover:underline"
          >
            Explore our collection
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
