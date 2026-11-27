'use client';

import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { discountPercent } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [zoomed, setZoomed] = useState(false);
  const discount = discountPercent(product.price, product.oldPrice);
  const images = product.images;

  function move(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden rounded-[26px] bg-white shadow-[inset_0_0_0_1px_rgba(46,31,23,0.06)] md:rounded-[32px]"
        onMouseMove={move}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        {images.map((image, imageIndex) => (
          <Image
            key={image}
            src={image}
            alt={`${product.name} — ${imageIndex + 1}-rasm`}
            fill
            priority={imageIndex === 0}
            sizes="(min-width: 1024px) 46vw, 92vw"
            className={clsx(
              'object-contain p-5 transition-[opacity,transform] duration-500 ease-silk md:p-8',
              imageIndex === index ? 'opacity-100' : 'opacity-0',
              imageIndex === index && zoomed ? 'scale-[1.65]' : 'scale-100',
            )}
            style={{
              transformOrigin: `${origin.x}% ${origin.y}%`,
              transitionDuration: zoomed ? '120ms' : '400ms',
            }}
          />
        ))}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5 md:left-5 md:top-5">
          {product.badge === 'new' && (
            <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold text-cream">
              YANGI
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-orange px-3 py-1 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>

        <FavoriteButton
          slug={product.slug}
          className="absolute right-3 top-3 h-11 w-11 md:right-5 md:top-5"
        />

        <span className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1.5 text-[10.5px] font-medium text-cocoa backdrop-blur md:inline-flex">
          <Expand className="h-3 w-3" />
          Kattalashtirish
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Oldingi rasm"
              onClick={() => setIndex((index - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-tag transition-colors hover:bg-white md:left-4"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Keyingi rasm"
              onClick={() => setIndex((index + 1) % images.length)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-tag transition-colors hover:bg-white md:right-4"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {images.map((image, imageIndex) => (
            <button
              key={image}
              type="button"
              onClick={() => setIndex(imageIndex)}
              aria-label={`${imageIndex + 1}-rasmni ko'rsatish`}
              aria-pressed={imageIndex === index}
              className={clsx(
                'relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl bg-white transition-all duration-300',
                imageIndex === index
                  ? 'ring-2 ring-ink ring-offset-2 ring-offset-cream'
                  : 'opacity-70 hover:opacity-100 ring-1 ring-ink/10',
              )}
            >
              <Image src={image} alt="" fill sizes="76px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
