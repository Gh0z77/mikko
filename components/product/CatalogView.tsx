'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { INTERESTS_CHANGED, interestScore } from '@/lib/interests';
import { storePhone, storePhoneHref } from '@/lib/nav';
import type { ColorOption, Product } from '@/lib/types';

type SortKey = 'recommended' | 'new' | 'price-asc' | 'price-desc' | 'discount';

const sortLabels: Record<SortKey, string> = {
  recommended: 'Tavsiya etilgan',
  new: 'Yangi kelganlar',
  'price-asc': "Narx: arzondan qimmatga",
  'price-desc': 'Narx: qimmatdan arzonga',
  discount: "Eng katta chegirma",
};

const priceBuckets = [
  { key: '0-200000', label: "200 000 gacha", test: (price: number) => price < 200000 },
  {
    key: '200000-350000',
    label: "200–350 ming",
    test: (price: number) => price >= 200000 && price < 350000,
  },
  {
    key: '350000-500000',
    label: "350–500 ming",
    test: (price: number) => price >= 350000 && price < 500000,
  },
  { key: '500000-', label: "500 mingdan yuqori", test: (price: number) => price >= 500000 },
];

interface CatalogViewProps {
  products: Product[];
  title: string;
  description?: string;
  initialSort?: SortKey;
  initialSizes?: string[];
  breadcrumb?: { href: string; label: string }[];
  emptyText?: string;
}

export function CatalogView({
  products,
  title,
  description,
  initialSort = 'recommended',
  initialSizes = [],
  breadcrumb = [],
  emptyText = "Bu bo'limda hozircha mahsulot yo'q.",
}: CatalogViewProps) {
  const reduceMotion = useReducedMotion();
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [sizes, setSizes] = useState<string[]>(initialSizes);
  const [colors, setColors] = useState<string[]>([]);
  const [buckets, setBuckets] = useState<string[]>([]);
  const [onlySale, setOnlySale] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interestTick, setInterestTick] = useState(0);
  useEffect(() => {
    const bump = () => setInterestTick((n) => n + 1);
    bump(); // cookie is only readable after mount
    window.addEventListener(INTERESTS_CHANGED, bump);
    return () => window.removeEventListener(INTERESTS_CHANGED, bump);
  }, []);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => product.sizes.forEach((size) => set.add(size)));
    return [...set].sort((a, b) => Number(a) - Number(b));
  }, [products]);

  const allColors = useMemo(() => {
    const map = new Map<string, ColorOption>();
    products.forEach((product) =>
      product.colors.forEach((color) => {
        if (!map.has(color.name)) map.set(color.name, color);
      }),
    );
    return [...map.values()];
  }, [products]);

  const activeCount = sizes.length + colors.length + buckets.length + (onlySale ? 1 : 0);

  const list = useMemo(() => {
    let result = products.filter((product) => {
      if (sizes.length && !product.sizes.some((size) => sizes.includes(size))) return false;
      if (colors.length && !product.colors.some((color) => colors.includes(color.name)))
        return false;
      if (buckets.length) {
        const matches = priceBuckets
          .filter((bucket) => buckets.includes(bucket.key))
          .some((bucket) => bucket.test(product.price));
        if (!matches) return false;
      }
      if (onlySale && !product.oldPrice) return false;
      return true;
    });

    result = [...result];
    switch (sort) {
      case 'new':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        result.sort((a, b) => {
          const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
          const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
          return db - da;
        });
        break;
      default:
        // 'Recommended' = what this visitor showed interest in first, then highlighted items.
        result.sort(
          (a, b) =>
            interestScore(b) - interestScore(a) || Number(Boolean(b.badge)) - Number(Boolean(a.badge)),
        );
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, sizes, colors, buckets, onlySale, sort, interestTick]);

  function toggle(value: string, state: string[], setState: (next: string[]) => void) {
    setState(state.includes(value) ? state.filter((item) => item !== value) : [...state, value]);
  }

  function reset() {
    setSizes([]);
    setColors([]);
    setBuckets([]);
    setOnlySale(false);
  }

  const filters = (
    <div className="space-y-7">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold">O&apos;lcham</h3>
          {sizes.length > 0 && (
            <button
              type="button"
              onClick={() => setSizes([])}
              className="text-[11px] text-cocoa underline underline-offset-2"
            >
              tozalash
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggle(size, sizes, setSizes)}
              aria-pressed={sizes.includes(size)}
              className={clsx(
                'h-9 min-w-[42px] rounded-xl border px-2 text-[12px] font-semibold tabular-nums transition-colors',
                sizes.includes(size)
                  ? 'border-ink bg-ink text-cream'
                  : 'border-ink/12 bg-white/60 hover:border-ink/40',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-bold">Rang</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allColors.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => toggle(color.name, colors, setColors)}
              aria-pressed={colors.includes(color.name)}
              className={clsx(
                'inline-flex h-9 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium transition-colors',
                colors.includes(color.name)
                  ? 'border-ink bg-ink text-cream'
                  : 'border-ink/12 bg-white/60 hover:border-ink/40',
              )}
            >
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/15"
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-bold">Narx</h3>
        <div className="mt-3 space-y-2">
          {priceBuckets.map((bucket) => (
            <label
              key={bucket.key}
              className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-ink/85"
            >
              <input
                type="checkbox"
                checked={buckets.includes(bucket.key)}
                onChange={() => toggle(bucket.key, buckets, setBuckets)}
                className="h-4 w-4 rounded border-ink/25 accent-orange"
              />
              {bucket.label}
            </label>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] font-medium">
        <input
          type="checkbox"
          checked={onlySale}
          onChange={(event) => setOnlySale(event.target.checked)}
          className="h-4 w-4 rounded border-ink/25 accent-orange"
        />
        Faqat chegirmadagi mahsulotlar
      </label>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-full border border-ink/15 py-2.5 text-[12.5px] font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-cream"
        >
          Filtrlarni tozalash ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="border-b border-ink/8 bg-[#FFF1E6]">
        <div className="container-page py-8 md:py-12">
          <nav aria-label="Yo'l ko'rsatkich" className="text-[12px] text-cocoa">
            <Link href="/" className="hover:text-ink">
              Bosh sahifa
            </Link>
            {breadcrumb.map((item) => (
              <span key={item.href}>
                <span className="mx-1.5 text-ink/30">/</span>
                <Link href={item.href} className="hover:text-ink">
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
          <h1 className="mt-3 text-[34px] leading-[1.03] sm:text-[44px] md:text-[52px]">{title}</h1>
          {description && (
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-cocoa md:text-[15px]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="container-page mt-8 md:mt-10">
        <div className="flex items-center justify-between gap-3">
          <p className="whitespace-nowrap text-[12.5px] font-medium text-cocoa">
            <span className="font-bold text-ink">{list.length}</span> ta mahsulot
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-ink/15 bg-white/60 px-3.5 text-[12.5px] font-semibold lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtrlar
              {activeCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-orange px-1 text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <div className="relative min-w-0">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                aria-label="Saralash"
                className="h-10 w-full max-w-[148px] appearance-none truncate rounded-full border border-ink/15 bg-white/60 pl-3 pr-7 text-[11.5px] font-semibold outline-none transition-colors hover:border-ink/40 focus:border-ink sm:max-w-none sm:pl-4 sm:pr-9 sm:text-[12.5px]"
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cocoa sm:right-3.5" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[22px] border border-ink/8 bg-white/45 p-5">
              {filters}
            </div>
          </aside>

          <div>
            {list.length > 0 ? (
              <ProductGrid key={`${sort}-${activeCount}-${list.length}`} products={list} />
            ) : (
              <div className="rounded-[24px] border border-dashed border-ink/20 bg-white/40 px-6 py-16 text-center">
                <p className="font-display text-[22px]">Hech narsa topilmadi</p>
                <p className="mx-auto mt-2 max-w-sm text-[13.5px] text-cocoa">{emptyText}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[12.5px] font-semibold text-cream"
                >
                  Filtrlarni tozalash
                </button>
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[22px] bg-orange-soft/60 px-5 py-4 text-[12.5px] text-cocoa">
              <span className="font-semibold text-ink">O&apos;lchamga ishonchingiz komilmasa?</span>
              <span>Bepul maslahat uchun qo&apos;ng&apos;iroq qiling:</span>
              <a
                href={storePhoneHref}
                className="font-semibold text-ink underline underline-offset-2"
              >
                {storePhone}
              </a>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <motion.button
              type="button"
              aria-label="Filtrlarni yopish"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filtrlar"
              initial={{ y: reduceMotion ? 0 : '100%' }}
              animate={{ y: 0 }}
              exit={{ y: reduceMotion ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-cream p-5 pb-8"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-[24px]">Filtrlar</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Yopish"
                  className="grid h-10 w-10 place-items-center rounded-full bg-ink/[0.06]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {filters}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="mt-6 h-12 w-full rounded-full bg-orange text-[14px] font-semibold text-white"
              >
                {list.length} ta mahsulotni ko&apos;rsatish
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
