'use client';

import Link from 'next/link';

import { BrandAccordionChevron } from '@/components/layout/BrandContent/BrandAccordionChevron';
import {
  BRAND_CONTENT_CLOSING_LINK_HREF,
  BRAND_CONTENT_CLOSING_LINK_TEXT,
  BRAND_CONTENT_CLOSING_PREFIX,
  BRAND_CONTENT_HEADING,
  BRAND_CONTENT_INTRO,
  brandAccordionSections,
  type BrandAccordionSection,
  type BrandContentBlock,
} from '@/config/brand-content.config';
import { cn } from '@/lib/utils/cn';

function BrandBodyText({
  children,
  className,
  italic,
}: {
  children: React.ReactNode;
  className?: string;
  italic?: boolean;
}) {
  return (
    <p
      className={cn(
        'font-nunito-sans tab:text-[15px] tab:leading-[27px] text-[13px] leading-[22px] text-[#868686]',
        italic && 'italic',
        className,
      )}
    >
      {children}
    </p>
  );
}

function BrandSubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-nunito-sans text-[15px] leading-[27px] font-normal text-[#6b6b6b]">
      {children}
    </h4>
  );
}

function BrandFaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group/faq border-b border-black/5 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-2.5 text-[15px] leading-[27px] text-[#6b6b6b] [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span className="mt-0.5 shrink-0 transition-transform duration-200 group-open/faq:rotate-180">
          <BrandAccordionChevron size="md" />
        </span>
      </summary>
      <BrandBodyText className="pb-3">{answer}</BrandBodyText>
    </details>
  );
}

function BrandContentBlockRenderer({ block }: { block: BrandContentBlock }) {
  if (block.type === 'paragraph') {
    return (
      <BrandBodyText
        italic={block.italic}
        className={cn('pt-3 first:pt-0', block.mutedLabel && 'text-[#6b6b6b]')}
      >
        {block.text}
      </BrandBodyText>
    );
  }

  if (block.type === 'bullets') {
    return (
      <div className="pt-4">
        {block.label ? (
          <p className="font-nunito-sans text-[13px] leading-[22px] text-[#6b6b6b]">
            {block.label}
          </p>
        ) : null}
        <ul className="mt-3 space-y-1 pl-1">
          {block.items.map((item) => (
            <li key={item}>
              <BrandBodyText>{item}</BrandBodyText>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === 'subsection') {
    return (
      <div className="pt-5 first:pt-0">
        <BrandSubsectionTitle>{block.title}</BrandSubsectionTitle>
        {block.paragraphs.map((paragraph) => (
          <BrandBodyText key={paragraph} className="pt-2">
            {paragraph}
          </BrandBodyText>
        ))}
      </div>
    );
  }

  if (block.type === 'faq') {
    return (
      <div className="pt-1">
        {block.items.map((item) => (
          <BrandFaqItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
    );
  }

  return null;
}

function BrandAccordionItem({ section }: { section: BrandAccordionSection }) {
  return (
    <details className="group/section border-b border-black/5" open={section.defaultOpen}>
      <summary
        className={cn(
          'tab:text-[15px] flex cursor-pointer list-none items-center justify-between py-3 text-[13px] leading-[20px] [&::-webkit-details-marker]:hidden',
          'text-[#6b6b6b] group-open/section:text-[#444]',
        )}
      >
        <span>{section.title}</span>
        <span className="shrink-0 transition-transform duration-200 group-open/section:rotate-180">
          <BrandAccordionChevron />
        </span>
      </summary>
      <div className="pb-4">
        {section.blocks.map((block, index) => (
          <BrandContentBlockRenderer key={`${section.id}-${index}`} block={block} />
        ))}
      </div>
    </details>
  );
}

export function BrandContentSection() {
  return (
    <section className="border-t border-black/5 bg-white" aria-label="Brand information">
      <div className="tab:px-6 tab:py-10 container px-4 py-6">
        <div className="mx-auto w-full max-w-[1440px]">
          <h2 className="font-nunito-sans tab:text-[15px] tab:leading-[26px] text-[13px] leading-[22px] font-normal text-[#868686]">
            {BRAND_CONTENT_HEADING}
          </h2>
          <p className="font-nunito-sans tab:text-[15px] tab:leading-[26px] mt-2.5 text-[13px] leading-[22px] font-normal text-[#868686]">
            {BRAND_CONTENT_INTRO}
          </p>

          <div className="mt-7">
            {brandAccordionSections.map((section) => (
              <BrandAccordionItem key={section.id} section={section} />
            ))}
          </div>

          <p className="font-nunito-sans tab:text-[15px] tab:leading-[26px] mt-7 text-[13px] leading-[22px] text-[#868686]">
            {BRAND_CONTENT_CLOSING_PREFIX}
            <Link
              href={BRAND_CONTENT_CLOSING_LINK_HREF}
              className="text-[#6b6b6b] underline-offset-2 hover:underline"
            >
              {BRAND_CONTENT_CLOSING_LINK_TEXT}
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
