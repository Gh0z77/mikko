import { CatalogView } from '@/components/product/CatalogView';
import { categories, getProductsByCategory } from '@/lib/products';
import type { CategorySlug } from '@/lib/types';
import { TrackCategory } from './TrackCategory';

export function CategoryCatalog({ slug }: { slug: CategorySlug }) {
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
