import type { Metadata } from 'next';
import { CatalogView } from '@/components/product/CatalogView';
import { products, searchProducts } from '@/lib/products';
import { refreshCatalog } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Katalog',
  description:
    "MIKKO katalogi: o'g'il bolalar, qizlar va chaqaloqlar uchun kiyimlar, oyoq kiyimlar va aksessuarlar.",
};

type SortKey = 'recommended' | 'new' | 'price-asc' | 'price-desc' | 'discount';

const validSorts: SortKey[] = ['new', 'price-asc', 'price-desc', 'discount'];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string; size?: string }>;
}) {
  await refreshCatalog();
  const { sort, q, size } = await searchParams;
  const initialSizes = (size ?? '').split(',').filter((s) => /^\d{2,3}$/.test(s)).slice(0, 6);
  const query = q?.trim().slice(0, 60);
  const initialSort = validSorts.includes(sort as SortKey) ? (sort as SortKey) : 'recommended';

  return (
    <CatalogView
      key={`${query ?? ''}|${initialSizes.join(',')}`}
      products={query ? searchProducts(query) : products}
      title={query ? `«${query}» bo'yicha natijalar` : 'Butun katalog'}
      description={
        query
          ? undefined
          : "Barcha mahsulotlar bir joyda: o'lcham, rang va narx bo'yicha filtrlab, o'zingizga mos variantni tanlang."
      }
      emptyText={query ? "Hech narsa topilmadi. Boshqa so'z bilan qidirib ko'ring." : undefined}
      initialSort={initialSort}
      initialSizes={initialSizes}
    />
  );
}
