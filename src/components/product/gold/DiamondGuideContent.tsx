import Image from 'next/image';

import { diamondGuideContent, productTheme } from '@/config/product/product.config';

function BracketMark({ label }: { label: string }) {
  return (
    <div className="mt-1 flex flex-col items-center gap-0.5">
      <div className="flex h-4 items-end">
        <span
          className="block h-3 w-px"
          style={{ backgroundColor: productTheme.gold.accent }}
          aria-hidden="true"
        />
        <span
          className="mb-0 block h-px w-10"
          style={{ backgroundColor: productTheme.gold.accent }}
          aria-hidden="true"
        />
        <span
          className="block h-3 w-px"
          style={{ backgroundColor: productTheme.gold.accent }}
          aria-hidden="true"
        />
      </div>
      <p className="text-[8px] capitalize" style={{ color: productTheme.ink }}>
        {label}
      </p>
    </div>
  );
}

function TickMark({ label }: { label: string }) {
  return (
    <div className="mt-1 flex flex-col items-center gap-0.5">
      <span
        className="block h-4 w-px"
        style={{ backgroundColor: productTheme.gold.accent }}
        aria-hidden="true"
      />
      <p className="text-[8px] capitalize" style={{ color: productTheme.ink }}>
        {label}
      </p>
    </div>
  );
}

/** Static diamond guide body matching Figma Colour + Clarity cards. */
export function DiamondGuideContent() {
  const { colour, clarity } = diamondGuideContent;

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="flex flex-col gap-1">
        <p
          className="font-eb-garamond text-[28px] leading-tight font-medium capitalize"
          style={{ color: productTheme.gold.accent }}
        >
          {diamondGuideContent.headlineLine1}
          <br />
          {diamondGuideContent.headlineLine2}
        </p>
        <p className="text-[22px] font-bold capitalize" style={{ color: productTheme.success }}>
          {diamondGuideContent.saveLine}
        </p>
        <div
          className="mt-2 h-px w-full"
          style={{ backgroundColor: productTheme.gold.accent }}
          aria-hidden="true"
        />
      </div>

      <section className="rounded-[11px] bg-white p-3" aria-labelledby="diamond-guide-colour">
        <h3
          id="diamond-guide-colour"
          className="text-[13px] font-bold"
          style={{ color: productTheme.ink }}
        >
          {colour.title}
        </h3>
        <p className="mt-0.5 text-[11px] capitalize" style={{ color: productTheme.ink }}>
          {colour.body}
        </p>
        <div className="mt-3 flex items-start justify-between gap-1">
          {colour.grades.map((grade) => (
            <div key={grade.label} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="relative aspect-[1214/749] w-full max-w-[36px]">
                <Image src={grade.image} alt="" fill className="object-contain" sizes="40px" />
              </div>
              <p
                className="mt-1 text-center text-[8px] capitalize"
                style={{ color: productTheme.ink }}
              >
                {grade.label}
              </p>
              {grade.mark === 'palmonas' && grade.label === 'E-F' ? (
                <BracketMark label={colour.palmonasLabel} />
              ) : null}
              {grade.mark === 'colourless' ? <TickMark label={colour.colourlessLabel} /> : null}
            </div>
          ))}
        </div>
        {/* Bracket under G-H + E-F pair — visual cue when E-F already marked; G-H empty spacer */}
        <div className="relative mt-1">
          <Image
            src={colour.arrowImage}
            alt=""
            width={300}
            height={7}
            className="h-[7px] w-full object-contain"
          />
        </div>
      </section>

      <section className="rounded-[11px] bg-white p-3" aria-labelledby="diamond-guide-clarity">
        <h3
          id="diamond-guide-clarity"
          className="text-[13px] font-bold"
          style={{ color: productTheme.ink }}
        >
          {clarity.title}
        </h3>
        <p className="mt-0.5 text-[11px] capitalize" style={{ color: productTheme.ink }}>
          {clarity.body}
        </p>
        <div className="mt-3 flex items-start justify-between gap-1">
          {clarity.grades.map((grade) => (
            <div key={grade.label} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="relative aspect-[1214/749] w-full max-w-[36px]">
                <Image src={clarity.image} alt="" fill className="object-contain" sizes="40px" />
              </div>
              <p
                className="mt-1 text-center text-[8px] capitalize"
                style={{ color: productTheme.ink }}
              >
                {grade.label}
              </p>
              {grade.mark === 'flawless' ? <TickMark label={clarity.flawlessLabel} /> : null}
              {grade.mark === 'palmonas' && grade.label === 'VS1/VS2' ? (
                <BracketMark label={clarity.palmonasLabel} />
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
