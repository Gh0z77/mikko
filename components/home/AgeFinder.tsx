'use client';

import { useMemo, useState } from 'react';
import { track } from '@/lib/interests';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Backpack, Baby, Bike, Palette, Puzzle, Shapes } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { buttonClass } from '@/components/ui/buttonClass';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/format';

// Typical height (cm) = clothing size for each age band.
const ages = [
  { label: '0–1', title: 'Chaqaloq', sizes: ['74', '80'], icon: Baby },
  { label: '1–2', title: '1–2 yosh', sizes: ['86', '92'], icon: Puzzle },
  { label: '2–3', title: '2–3 yosh', sizes: ['92', '98'], icon: Shapes },
  { label: '3–5', title: '3–5 yosh', sizes: ['98', '104', '110'], icon: Palette },
  { label: '5–7', title: '5–7 yosh', sizes: ['110', '116', '122'], icon: Bike },
  { label: '7–10', title: '7–10 yosh', sizes: ['122', '128', '134', '140'], icon: Backpack },
];

export function AgeFinder() {
  const reduce = useReducedMotion();
  const [index, setIndexState] = useState(3);
  // Remember the chosen age (as sizes) only when the visitor actually picks one.
  const setIndex = (next: number) => {
    setIndexState(next);
    track({ type: 'size', sizes: ages[next].sizes });
  };
  const age = ages[index];
  const matches = useMemo(
    () => products.filter((p) => p.sizes.some((size) => age.sizes.includes(size))).slice(0, 4),
    [age],
  );
  const progress = index / (ages.length - 1);

  return (
    <section className="container-page mt-16 md:mt-24" aria-labelledby="age-title">
      <div id="age-title">
        <SectionHeading
          eyebrow="Tez tanlash"
          title="Bolangiz necha yoshda?"
          description="Yoshni tanlang — mos o'lcham va kiyimlarni darhol ko'rsatamiz."
        />
      </div>

      <div className="mt-8 grid gap-6 rounded-[32px] bg-white p-5 shadow-[0_30px_60px_-40px_rgba(38,32,28,0.35)] md:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div>
          {/* Track with a bear that walks to the chosen age. */}
          <div className="relative px-4 pt-14">
            <div className="absolute inset-x-4 top-0">
            <motion.div
              className="absolute top-0 -translate-x-1/2 text-center"
              initial={false}
              animate={{ left: `${progress * 100}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            >
              <motion.span
                key={index}
                initial={reduce ? false : { y: -10, rotate: -12 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className="block"
              >
                <Image src="/images/mikko-bear.png" alt="" width={152} height={110} className="h-9 w-auto" />
              </motion.span>
            </motion.div>
            </div>
            <div className="relative h-3 rounded-full bg-orange-soft">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FFB36B] to-orange"
                animate={{ width: `${progress * 100}%` }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={ages.length - 1}
              step={1}
              value={index}
              onChange={(event) => setIndex(Number(event.target.value))}
              aria-label="Bolaning yoshi"
              aria-valuetext={age.title}
              className="absolute inset-x-4 bottom-[-6px] h-6 cursor-pointer opacity-0"
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ages.map((item, i) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                className={`rounded-2xl border px-2 py-2.5 text-center transition-all duration-300 ${
                  i === index
                    ? 'border-orange bg-orange text-white shadow-[0_12px_24px_-12px_rgba(254,103,0,0.8)]'
                    : 'border-ink/10 hover:border-orange/50'
                }`}
              >
                <item.icon className="mx-auto h-5 w-5" />
                <span className="mt-0.5 block text-[12px] font-bold">{item.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-2xl bg-orange-mist p-5"
            >
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-orange-deep">{age.title}</p>
              <p className="mt-1 font-display text-[30px] font-semibold leading-none">
                O&apos;lcham {age.sizes[0]}–{age.sizes[age.sizes.length - 1]}
              </p>
              <p className="mt-2 text-[13px] text-cocoa">
                Bo&apos;yi taxminan {age.sizes[0]}–{age.sizes[age.sizes.length - 1]} sm. Shubha bo&apos;lsa —
                kattarog&apos;ini oling, bola tez o&apos;sadi.
              </p>
              <Link
                href={`/catalog?size=${age.sizes.join(',')}`}
                className={buttonClass('primary', 'md', 'mt-4 group')}
              >
                Mos kiyimlarni ko&apos;rish
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {matches.map((product, i) => (
              <motion.div
                key={`${index}-${product.slug}`}
                layout
                initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: i % 2 ? 3 : -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: i * 0.06 }}
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="group block rounded-[22px] bg-cream p-3 transition-shadow hover:shadow-lift"
                >
                  <span className="relative block aspect-square">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, 45vw"
                      className="object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-2 block truncate text-[12.5px] font-semibold">{product.name}</span>
                  <span className="block text-[13px] font-bold tabular-nums text-orange-deep">{formatPrice(product.price)}</span>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
