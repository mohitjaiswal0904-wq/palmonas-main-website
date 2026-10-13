import Image from 'next/image';
import type { ReactNode } from 'react';

import {
  ABOUT_HERO_IMAGE,
  ABOUT_INTRO,
  ABOUT_MISSION_BODY,
  ABOUT_MISSION_HEADING,
  ABOUT_MISSION_QUOTE,
  ABOUT_SHRADDHA_HEADING,
  ABOUT_SHRADDHA_STORY,
  ABOUT_STORE_EXTERIOR_IMAGE,
  ABOUT_STORE_HEADING,
  ABOUT_STORE_LIFESTYLE_IMAGE,
  ABOUT_STORE_PARAGRAPHS,
  ABOUT_STORES_INFOGRAPHIC_IMAGE,
  ABOUT_TAGLINE,
} from '@/config/about.config';
import { cn } from '@/lib/utils/cn';

const ABOUT_PAGE_MAX_WIDTH = 'max-w-[1617px]';
const ABOUT_HERO_ASPECT = 'aspect-[1920/762]';

function AboutSectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-nunito-sans tab:text-3xl laptop:text-[45px] laptop:leading-[56px] text-center text-2xl leading-tight font-normal text-[#222]">
      {children}
    </h2>
  );
}

function AboutSectionParagraph({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-nunito-sans laptop:text-[16px] laptop:leading-[27px] mx-auto max-w-[758px] text-center text-[15px] leading-[27px] text-[#878787]',
        className,
      )}
    >
      {children}
    </p>
  );
}

function AboutSplitImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="laptop:aspect-auto laptop:h-[516px] relative aspect-[780/516] w-full overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        loading="lazy"
        className="object-cover object-center"
        sizes="(max-width: 1024px) 100vw, 780px"
      />
    </div>
  );
}

function AboutSplitSection({
  imageSrc,
  imageAlt,
  imagePosition,
  heading,
  textOffsetClass,
  children,
}: {
  imageSrc: string;
  imageAlt: string;
  imagePosition: 'left' | 'right';
  heading: string;
  textOffsetClass?: string;
  children: ReactNode;
}) {
  const image = <AboutSplitImage src={imageSrc} alt={imageAlt} />;
  const text = (
    <div
      className={cn(
        'laptop:px-[22px] laptop:py-0 flex flex-col justify-center px-4 py-10',
        textOffsetClass,
      )}
    >
      <AboutSectionHeading>{heading}</AboutSectionHeading>
      <div className="laptop:mt-[22px] mt-5 space-y-4">{children}</div>
    </div>
  );

  return (
    <section className="laptop:pt-14 w-full">
      <div className={cn('laptop:px-4 mx-auto w-full', ABOUT_PAGE_MAX_WIDTH)}>
        <div className="laptop:grid laptop:grid-cols-2 laptop:items-start">
          {imagePosition === 'left' ? (
            <>
              {image}
              {text}
            </>
          ) : (
            <>
              <div className="laptop:order-2">{image}</div>
              <div className="laptop:order-1">{text}</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function AboutPageContent() {
  return (
    <main className="bg-white">
      <section className="relative w-full overflow-hidden bg-white">
        <div className="relative mx-auto w-full max-w-[1920px]">
          <div className={cn('relative w-full', ABOUT_HERO_ASPECT)}>
            <Image
              src={ABOUT_HERO_IMAGE}
              alt="Palmonas Demifine® jewellery with Shraddha Kapoor signature and brand store"
              fill
              priority
              className="object-contain object-center"
              sizes="100vw"
            />
          </div>
        </div>
        <div
          className="laptop:h-24 pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white"
          aria-hidden="true"
        />
      </section>

      <section
        className={cn(
          'laptop:px-4 laptop:pb-0 laptop:pt-[34px] relative mx-auto w-full px-4 pt-8 pb-6',
          ABOUT_PAGE_MAX_WIDTH,
        )}
      >
        <h1 className="font-nunito-sans tab:text-2xl laptop:text-[27px] laptop:leading-[38px] text-center text-xl font-semibold text-black">
          {ABOUT_TAGLINE}
        </h1>
        <p className="font-nunito-sans laptop:mt-0 laptop:text-[18px] laptop:leading-[34px] mx-auto mt-6 max-w-[1583px] text-center text-[15px] leading-[1.88] text-[#868686]">
          {ABOUT_INTRO}
        </p>
      </section>

      <AboutSplitSection
        imageSrc={ABOUT_STORES_INFOGRAPHIC_IMAGE}
        imageAlt="Palmonas stores across India infographic"
        imagePosition="left"
        heading={ABOUT_SHRADDHA_HEADING}
        textOffsetClass="laptop:pt-[130px]"
      >
        <AboutSectionParagraph>{ABOUT_SHRADDHA_STORY}</AboutSectionParagraph>
      </AboutSplitSection>

      <AboutSplitSection
        imageSrc={ABOUT_STORE_LIFESTYLE_IMAGE}
        imageAlt="Palmonas brand store lifestyle"
        imagePosition="right"
        heading={ABOUT_MISSION_HEADING}
        textOffsetClass="laptop:pt-[157px]"
      >
        <AboutSectionParagraph>
          <span className="font-semibold">&ldquo;{ABOUT_MISSION_QUOTE}&rdquo;</span>
          {ABOUT_MISSION_BODY}
        </AboutSectionParagraph>
      </AboutSplitSection>

      <AboutSplitSection
        imageSrc={ABOUT_STORE_EXTERIOR_IMAGE}
        imageAlt="Palmonas retail store exterior"
        imagePosition="left"
        heading={ABOUT_STORE_HEADING}
        textOffsetClass="laptop:pt-[117px]"
      >
        {ABOUT_STORE_PARAGRAPHS.map((paragraph) => (
          <AboutSectionParagraph key={paragraph}>{paragraph}</AboutSectionParagraph>
        ))}
      </AboutSplitSection>

      <div className="laptop:h-14 h-10" aria-hidden="true" />
    </main>
  );
}
