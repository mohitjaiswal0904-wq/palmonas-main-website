import Image from 'next/image';

const proofPoints = [
  {
    label: 'Waterproof',
    text: 'Wear daily without saving it for special occasions.',
  },
  {
    label: 'Anti-tarnish',
    text: 'Built for repeat styling and long-lasting shine.',
  },
  {
    label: 'Skin safe',
    text: 'Comfortable finishes for sensitive everyday wear.',
  },
] as const;

export function BrandStory() {
  return (
    <section className="tab:py-14 container py-8">
      <div className="tab:grid-cols-[0.9fr_1.1fr] tab:items-center grid gap-5">
        <div className="overflow-hidden rounded-[28px] bg-stone-100">
          <Image
            src="https://cdn.shopify.com/s/files/1/0613/1400/7297/files/PM-RING-070.jpg?v=1744528085"
            alt=""
            width={600}
            height={750}
            sizes="(min-width: 768px) 45vw, 100vw"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
        <div>
          <p className="tracking-palmonas-wider text-xs font-semibold text-amber-800 uppercase">
            Why Palmonas
          </p>
          <h2 className="font-eb-garamond mt-2 text-4xl leading-none text-stone-950">
            Premium jewellery that fits real life
          </h2>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            Designed in India and made for everyday luxury, Palmonas pieces bring together Demifine®
            materials, polished finishes, and easy styling across your wardrobe.
          </p>
          <div className="mt-6 space-y-3">
            {proofPoints.map((point) => (
              <article key={point.label} className="rounded-palmonas-lg bg-stone-50 p-4">
                <h3 className="font-medium text-stone-950">{point.label}</h3>
                <p className="mt-1 text-sm text-stone-600">{point.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
