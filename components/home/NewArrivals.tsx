'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { products } from '@/lib/products';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { ProductGrid } from '@/components/product/ProductGrid';

const tabs = [
  { key: 'all', label: 'Hammasi' },
  { key: 'boys', label: "O'g'il bolalar" },
  { key: 'girls', label: 'Qizlar' },
  { key: 'baby', label: 'Chaqaloqlar' },
  { key: 'shoes', label: 'Oyoq kiyimlar' },
  { key: 'accessories', label: 'Aksessuarlar' },
] as const;

export function NewArrivals() {
  const [active, setActive] = useState<(typeof tabs)[number]['key']>('all');

  const list = useMemo(() => {
    const filtered =
      active === 'all' ? products : products.filter((product) => product.category === active);
    return [...filtered].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
  }, [active]);

  return (
    <section className="container-page mt-16 md:mt-24" aria-labelledby="new-arrivals-title">
      <Reveal>
        <div id="new-arrivals-title">
          <SectionHeading
            title="Yangi kelganlar"
            description="Har hafta yangilanadigan to'plam: birinchi bo'lib tanlang."
            href="/catalog?sort=new"
            linkLabel="Barcha yangiliklar"
          />
        </div>
      </Reveal>

      <div className="no-scrollbar -mx-4 mt-7 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            aria-pressed={active === tab.key}
            className={clsx(
              'h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors duration-300',
              active === tab.key
                ? 'bg-ink text-cream'
                : 'border border-ink/12 bg-white/50 text-ink hover:border-ink/40',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-7">
        <ProductGrid key={active} products={list} />
      </div>
    </section>
  );
}
