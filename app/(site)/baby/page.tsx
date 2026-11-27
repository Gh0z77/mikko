import type { Metadata } from 'next';
import { CategoryCatalog } from '@/components/product/CategoryCatalog';
import { categories } from '@/lib/products';

const category = categories.find((item) => item.slug === 'baby');

export const metadata: Metadata = {
  title: category?.title ?? 'Katalog',
  description: category?.description,
};

export default function Page() {
  return <CategoryCatalog slug="baby" />;
}
