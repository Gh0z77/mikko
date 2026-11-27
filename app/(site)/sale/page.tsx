import type { Metadata } from 'next';
import { CatalogView } from '@/components/product/CatalogView';
import { getSaleProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Aksiyalar',
  description: "Chegirmadagi bolalar kiyimlari: mavsumiy to'plamlar va oxirgi o'lchamlar.",
};

export default function SalePage() {
  const saleProducts = getSaleProducts();

  return (
    <CatalogView
      products={saleProducts}
      title="Aksiyalar"
      description="Chegirmadagi to'plamlar. Miqdor cheklangan — yoqtirgan modelingizni vaqtida band qiling."
      breadcrumb={[{ href: '/catalog', label: 'Katalog' }]}
      initialSort="discount"
      emptyText="Hozircha chegirmadagi mahsulotlar yo'q. Yangi aksiyalarni kuting!"
    />
  );
}
