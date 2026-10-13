import type { Product } from '@/types/product';
import type {
  ProductFilterGroup,
  ProductFilterOption,
  ProductFilters,
  ProductSortOption,
} from '@/types/product-listing';

function normaliseFilterValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-');
}

function matchesPriceFilter(product: Product, option: ProductFilterOption | undefined): boolean {
  if (typeof option?.min === 'number' && typeof option.max === 'number') {
    return product.price >= option.min && product.price <= option.max;
  }

  if (typeof option?.min === 'number') {
    return product.price >= option.min;
  }

  const filterValue = option?.value ?? option?.label ?? option?.id ?? '';
  const numbers = filterValue.match(/\d+/g)?.map(Number) ?? [];
  const normalisedValue = normaliseFilterValue(filterValue);

  if (numbers.length >= 2) {
    const min = numbers[0];
    const max = numbers[1];

    if (min === undefined || max === undefined) {
      return true;
    }

    return product.price >= min && product.price <= max;
  }

  const singleNumber = numbers[0];

  if (singleNumber === undefined) {
    return true;
  }

  if (/above|over|greater|more/.test(normalisedValue)) {
    return product.price >= singleNumber;
  }

  if (/under|below|less/.test(normalisedValue)) {
    return product.price < singleNumber;
  }

  switch (option?.id) {
    case 'under-2000':
      return product.price < 2000;
    case '2000-5000':
      return product.price >= 2000 && product.price <= 5000;
    case 'over-5000':
      return product.price > 5000;
    default:
      return true;
  }
}

function getSelectedOption(
  group: ProductFilterGroup | undefined,
  filterId: string,
): ProductFilterOption | undefined {
  return group?.options.find((option) => option.id === filterId);
}

function getProductFilterValues(product: Product, groupId: string): string[] {
  const normalisedGroupId = normaliseFilterValue(groupId);
  const attributes = product.filterAttributes ?? {};
  const values = [
    ...(attributes[groupId] ?? []),
    ...(attributes[normalisedGroupId] ?? []),
    ...(/category|product-type|type/.test(normalisedGroupId) ? [product.category] : []),
  ];

  return values.filter(Boolean);
}

function matchesAttributeFilter(product: Product, groupId: string, option: ProductFilterOption) {
  const selectedValues = [option.id, option.value, option.label]
    .filter((value): value is string => Boolean(value))
    .map(normaliseFilterValue);
  const productValues = getProductFilterValues(product, groupId).map(normaliseFilterValue);

  if (productValues.length === 0) {
    return true;
  }

  return productValues.some((productValue) =>
    selectedValues.some(
      (selectedValue) =>
        productValue === selectedValue ||
        productValue.includes(selectedValue) ||
        selectedValue.includes(productValue),
    ),
  );
}

function matchesFilterGroup(
  product: Product,
  groupId: string,
  selected: string[],
  filterGroups: ProductFilterGroup[],
): boolean {
  if (selected.length === 0) {
    return true;
  }

  const group = filterGroups.find((item) => item.id === groupId);
  const normalisedGroupId = normaliseFilterValue(groupId);

  return selected.some((filterId) => {
    const option = getSelectedOption(group, filterId) ?? { id: filterId, label: filterId };

    if (normalisedGroupId.includes('price')) {
      return matchesPriceFilter(product, option);
    }

    if (normalisedGroupId === 'category') {
      return matchesAttributeFilter(product, 'category', option);
    }

    return matchesAttributeFilter(product, groupId, option);
  });
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  filterGroups: ProductFilterGroup[] = [],
): Product[] {
  return products.filter((product) =>
    Object.entries(filters).every(([groupId, selected]) =>
      matchesFilterGroup(product, groupId, selected, filterGroups),
    ),
  );
}

export function sortProducts(products: Product[], sort: ProductSortOption): Product[] {
  const sorted = [...products];

  switch (sort) {
    case 'new-arrivals':
      return sorted.sort((a, b) => {
        const dateA = a.createdAt ? Date.parse(a.createdAt) : 0;
        const dateB = b.createdAt ? Date.parse(b.createdAt) : 0;

        return dateB - dateA;
      });
    case 'best-selling':
      return sorted;
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'featured':
    default:
      return sorted;
  }
}

export function applyProductListing(
  products: Product[],
  sort: ProductSortOption,
  filters: ProductFilters,
  filterGroups: ProductFilterGroup[] = [],
): Product[] {
  return sortProducts(filterProducts(products, filters, filterGroups), sort);
}
