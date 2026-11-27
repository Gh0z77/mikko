import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogFromUrl } from '@/components/product/CatalogFromUrl';
import { CatalogSkeleton } from '@/components/ui/Skeletons';
import { refreshCatalog } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Katalog',
  description:
    "MIKKO katalogi: o'g'il bolalar, qizlar va chaqaloqlar uchun kiyimlar, oyoq kiyimlar va aksessuarlar.",
};

export default async function CatalogPage() {
  await refreshCatalog();
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogFromUrl />
    </Suspense>
  );
}
