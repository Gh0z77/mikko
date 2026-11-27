import { CatalogView } from '@/components/product/CatalogView';
import { categories, getProductsByCategory } from '@/lib/products';
import { refreshCatalog } from '@/lib/catalog';
import type { CategorySlug } from '@/lib/types';
import { TrackCategory } from './TrackCategory';

export async function CategoryCatalog({ slug }: { slug: CategorySlug }) {
  await refreshCatalog();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return null;

  return (
    <>
    <TrackCategory category={slug} />
    <CatalogView
      products={getProductsByCategory(slug)}
      title={category.title}
      description={category.description}
      breadcrumb={[{ href: '/catalog', label: 'Katalog' }]}
    />
    </>
  );
}
