export interface AccountStepCard {
  title: string;
  description: string;
}

interface AccountStepCardsProps {
  title: string;
  steps: readonly AccountStepCard[];
  headingId?: string;
  numbered?: boolean;
}

/** Bordered step/info cards used across account info panels. */
export function AccountStepCards({
  title,
  steps,
  headingId = 'account-steps-heading',
  numbered = false,
}: AccountStepCardsProps) {
  return (
    <section className="mt-8" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-base font-bold text-[#151515]">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-[#EEEEEE] bg-white px-4 py-4">
            <div className="flex items-start gap-3">
              {numbered ? (
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFF5F5] text-xs font-bold text-[#151515]"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
              ) : null}
              <div>
                <p className="text-sm font-bold text-[#151515]">{step.title}</p>
                <p className="mt-1 text-xs leading-5 font-normal text-[#757575]">
                  {step.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
