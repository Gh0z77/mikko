'use client';

import { useSearchParams } from 'next/navigation';
import { CatalogView } from './CatalogView';
import { products, searchProducts } from '@/lib/products';

type SortKey = 'recommended' | 'new' | 'price-asc' | 'price-desc' | 'discount';
const validSorts: SortKey[] = ['new', 'price-asc', 'price-desc', 'discount'];

/** Reads ?q / ?sort / ?size in the browser so /catalog itself can stay a static, CDN-cached page. */
export function CatalogFromUrl() {
  const params = useSearchParams();
  const query = params.get('q')?.trim().slice(0, 60) || undefined;
  const sort = params.get('sort') as SortKey | null;
  const initialSizes = (params.get('size') ?? '').split(',').filter((s) => /^\d{2,3}$/.test(s)).slice(0, 6);

  return (
    <CatalogView
      key={`${query ?? ''}|${initialSizes.join(',')}|${sort ?? ''}`}
      products={query ? searchProducts(query) : products}
      title={query ? `«${query}» bo'yicha natijalar` : 'Butun katalog'}
      description={
        query
          ? undefined
          : "Barcha mahsulotlar bir joyda: o'lcham, rang va narx bo'yicha filtrlab, o'zingizga mos variantni tanlang."
      }
      emptyText={query ? "Hech narsa topilmadi. Boshqa so'z bilan qidirib ko'ring." : undefined}
      initialSort={sort && validSorts.includes(sort) ? sort : 'recommended'}
      initialSizes={initialSizes}
    />
  );
}
