'use client';

import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { ProductGrid } from '@/components/product/ProductGrid';
import { buttonClass } from '@/components/ui/buttonClass';
import { products } from '@/lib/products';
import { MascotSign } from '@/components/ui/MascotSign';

export default function FavoritesPage() {
  const { favorites, hydrated } = useStore();
  const items = products.filter((product) => favorites.includes(product.slug));

  return (
    <div className="container-page py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] leading-none md:text-[42px]">Sevimlilar</h1>
          <p className="mt-2 text-[13px] text-cocoa">
            {hydrated ? `${items.length} ta saqlangan mahsulot` : 'Yuklanmoqda...'}
          </p>
        </div>
        {items.length > 0 && (
          <Link href="/catalog" className="text-[12.5px] font-semibold text-ink hover:text-orange-deep">
            Katalogga o&apos;tish →
          </Link>
        )}
      </div>

      {!hydrated ? (
        <div className="mt-8 min-h-[40vh]" aria-busy="true" />
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-[32px] bg-white/60 px-6 py-12 text-center md:py-16">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-soft text-orange-deep">
            <Heart className="h-7 w-7" />
          </span>
          <h2 className="mt-5 text-[26px] md:text-[32px]">Sevimlilar ro&apos;yxati bo&apos;sh</h2>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-cocoa">
            Mahsulot kartasidagi yurakcha belgisini bosing — u shu yerda saqlanadi va keyin
            oson topiladi.
          </p>
          <Link href="/catalog" className={buttonClass('primary', 'md', 'mt-7')}>
            Mahsulotlarni ko&apos;rish
            <ArrowRight className="h-4 w-4" />
          </Link>
          <MascotSign text="Yoqtiring!" variant="king" height={128} className="mx-auto mt-8" />
        </div>
      ) : (
        <div className="mt-7">
          <ProductGrid products={items} animate={false} />
        </div>
      )}
    </div>
  );
}
