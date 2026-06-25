/** Centered section title with an optional subtitle, used across landing pages. */
export default function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h2 className="text-2xl font-bold capitalize text-[#151515] sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-base text-[#444] sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
