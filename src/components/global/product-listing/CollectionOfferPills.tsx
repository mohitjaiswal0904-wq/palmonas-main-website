import { PRODUCT_FILTER_TEXT_CLASS } from '@/components/global/product-listing/product-listing-classes';
import { cn } from '@/lib/utils/cn';

interface CollectionOfferPillsProps {
  offers: string[];
  className?: string;
}

export function CollectionOfferPills({ offers, className }: CollectionOfferPillsProps) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      {offers.map((offer) => (
        <span
          key={offer}
          className={cn(
            PRODUCT_FILTER_TEXT_CLASS,
            'border-palmonas-border inline-flex items-center rounded-full border bg-white px-4 py-2',
          )}
        >
          {offer}
        </span>
      ))}
    </div>
  );
}
