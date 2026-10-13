import Link from 'next/link';

interface ResourceNotFoundProps {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
  kicker?: string;
}

export function ResourceNotFound({
  title,
  description,
  ctaHref = '/',
  ctaLabel = 'Back to home',
  kicker = 'Not found',
}: ResourceNotFoundProps) {
  return (
    <main className="container flex min-h-[50vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="tracking-palmonas-wider text-sm text-amber-700 uppercase">{kicker}</p>
      <h1 className="font-display tab:text-4xl mt-4 text-3xl">{title}</h1>
      <p className="mt-4 max-w-md text-stone-600">{description}</p>
      <Link
        href={ctaHref}
        className="rounded-palmonas-md mt-8 bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
      >
        {ctaLabel}
      </Link>
    </main>
  );
}
