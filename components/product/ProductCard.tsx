'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { Check, Plus } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { TiltCard } from '@/components/ui/TiltCard';
import { Price } from '@/components/ui/Price';
import { discountPercent } from '@/lib/format';
import { categoryLabels } from '@/lib/products';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const { addToCart } = useStore();
  const [sizeOpen, setSizeOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product.price, product.oldPrice);
  const isNew = product.badge === 'new';

  function add(size: string) {
    addToCart({
      slug: product.slug,
      size,
      color: product.colors[0]?.name ?? 'Standart',
    });
    setSizeOpen(false);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className={clsx('group/card relative flex flex-col', className)}>
      <TiltCard className="overflow-hidden rounded-[24px] bg-white shadow-[inset_0_0_0_1px_rgba(38,32,28,0.06)] transition-shadow duration-500 group-hover/card:shadow-[0_30px_50px_-28px_rgba(254,103,0,0.55),inset_0_0_0_1px_rgba(254,103,0,0.25)]">
        {/* Soft orange halo that blooms behind the garment on hover. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 scale-50 rounded-full bg-orange-soft opacity-0 blur-2xl transition-all duration-700 ease-silk group-hover/card:scale-100 group-hover/card:opacity-100"
        />
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="relative block">
          <div className="relative aspect-[4/4.55]">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 47vw"
              className="object-contain p-3 transition-transform duration-[850ms] ease-silk group-hover/card:-translate-y-1.5 group-hover/card:-rotate-2 group-hover/card:scale-[1.07] sm:p-4"
            />
          </div>
        </Link>

        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {isNew && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold tracking-wide text-cream">
              YANGI
            </span>
          )}
          {discount && (
            <span className="animate-pulse-soft rounded-full bg-orange px-2.5 py-1 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>

        <FavoriteButton slug={product.slug} className="absolute right-2.5 top-2.5 h-9 w-9 md:h-10 md:w-10" />

        <div className="absolute inset-x-2.5 bottom-2.5 transition-all duration-300 ease-silk focus-within:translate-y-0 focus-within:opacity-100 md:translate-y-2 md:opacity-0 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          {sizeOpen ? (
            <div className="rounded-2xl bg-white/95 p-2 shadow-lift backdrop-blur">
              <div className="flex items-center justify-between px-1 pb-1.5">
                <span className="text-[10.5px] font-semibold text-cocoa">O&apos;lchamni tanlang</span>
                <button
                  type="button"
                  onClick={() => setSizeOpen(false)}
                  className="text-[10.5px] text-cocoa/80 underline underline-offset-2 hover:text-ink"
                >
                  bekor
                </button>
              </div>
              <div className="no-scrollbar flex gap-1 overflow-x-auto">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => add(size)}
                    className="h-8 shrink-0 rounded-full bg-cream px-2.5 text-[11.5px] font-semibold tabular-nums transition-colors hover:bg-ink hover:text-cream"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (product.sizes.length > 1) setSizeOpen(true);
                else add(product.sizes[0]);
              }}
              className={clsx(
                'flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-[12.5px] font-semibold transition-colors duration-300',
                added ? 'bg-ink text-cream' : 'bg-ink text-cream hover:bg-orange',
              )}
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5 text-orange" strokeWidth={3} />
                  Savatda
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Savatga
                </>
              )}
            </button>
          )}
        </div>
      </TiltCard>

      <div className="mt-3 flex flex-col gap-0.5 px-0.5">
        <span className="text-[11px] font-medium text-cocoa/75">
          {categoryLabels[product.category]}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.7em] text-[14px] font-semibold leading-snug transition-colors hover:text-orange-deep md:text-[15px]"
        >
          {product.name}
        </Link>
        <Price price={product.price} oldPrice={product.oldPrice} size="sm" className="mt-0.5" />
      </div>
    </article>
  );
}
