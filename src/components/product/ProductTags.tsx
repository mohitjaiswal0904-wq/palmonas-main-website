import { ProductTagBadge } from '@/components/product/ProductTagBadge';
import { cn } from '@/lib/utils/cn';
import type { ProductTag } from '@/types/product';

interface ProductTagsProps {
  tags?: ProductTag[];
  className?: string;
  /** Gold renders API selling-fast labels; demifine shows the shipping promise. */
  variant?: 'shipsIn24Hours' | 'sellingFast';
}

/** Shows header tags when the product has them. */
export function ProductTags({ tags, className, variant = 'shipsIn24Hours' }: ProductTagsProps) {
  if (!tags?.length) {
    return null;
  }

  if (variant === 'sellingFast') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {tags.map((tag) => (
          <ProductTagBadge
            key={`${tag.name}-${tag.value}`}
            variant="sellingFast"
            label={tag.value}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <ProductTagBadge />
    </div>
  );
}
