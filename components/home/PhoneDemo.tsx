'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import {
  BatteryFull,
  Check,
  ChevronDown,
  EllipsisVertical,
  Footprints,
  Gift,
  Percent,
  Search,
  Shirt,
  ShoppingBag,
  Signal,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react';
import { getProduct } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';

// A hand-built, self-playing preview of the Telegram Mini App (fixed 292×616 screen).
const W = 292;
const H = 616;

const cards = ['bej-ayiqcha-sviter', 'jigarrang-parka', 'kok-sport-kostyum', 'qishki-etik-mishka']
  .map(getProduct)
  .filter((p): p is Product => Boolean(p));
const hero = cards[1];

const chips = [
  { icon: Shirt, label: "O'g'il" },
  { icon: Sparkles, label: 'Qiz' },
  { icon: Gift, label: 'Chaqaloq' },
  { icon: Footprints, label: 'Oyoq kiyim' },
  { icon: Percent, label: 'Aksiya' },
];

// Demo script: where the finger goes and what the screen shows at each beat.
type Beat = { at: number; finger: { x: number; y: number } | null; tap?: boolean; sheet: boolean; size: boolean; added: boolean };
const SCRIPT: Beat[] = [
  { at: 0, finger: null, sheet: false, size: false, added: false },
  { at: 900, finger: { x: 215, y: 440 }, sheet: false, size: false, added: false },
  { at: 1700, finger: { x: 215, y: 440 }, tap: true, sheet: false, size: false, added: false },
  { at: 2100, finger: null, sheet: true, size: false, added: false },
  { at: 3000, finger: { x: 153, y: 491 }, sheet: true, size: false, added: false },
  { at: 3600, finger: { x: 153, y: 491 }, tap: true, sheet: true, size: true, added: false },
  { at: 4400, finger: { x: 146, y: 578 }, sheet: true, size: true, added: false },
  { at: 5000, finger: { x: 146, y: 578 }, tap: true, sheet: true, size: true, added: false },
  { at: 5400, finger: null, sheet: false, size: true, added: true },
  { at: 9000, finger: null, sheet: false, size: false, added: false },
];
const LOOP = 9600;

export function PhoneDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      SCRIPT.forEach((b, i) => timers.push(setTimeout(() => setBeat(i), b.at)));
      timers.push(setTimeout(run, LOOP));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  const state = reduce ? { ...SCRIPT[0], added: true } : SCRIPT[beat];

  return (
    <div ref={ref} className="relative h-[640px] w-[316px] rounded-[50px] bg-[#0F0F10] p-3 shadow-[0_50px_80px_-30px_rgba(0,0,0,0.6),inset_0_0_0_2px_rgba(255,255,255,0.08)]">
      <span aria-hidden="true" className="absolute left-1/2 top-[22px] z-30 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
      <div className="relative overflow-hidden rounded-[39px] bg-[#FFF8F3] text-ink" style={{ width: W, height: H }} aria-label="MIKKO Telegram ilovasi namoyishi" role="img">
        {/* Status bar */}
        <div className="flex h-7 items-center justify-between px-6 pt-1 text-[11px] font-semibold text-ink">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <Signal className="h-3 w-3" />
            <Wifi className="h-3 w-3" />
            <BatteryFull className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Telegram Mini App header */}
        <div className="flex h-11 items-center justify-between border-b border-ink/5 px-3">
          <span className="flex items-center gap-1 text-[12px] font-semibold text-[#2A9DD8]">
            <X className="h-4 w-4" /> Yopish
          </span>
          <span className="text-center leading-tight">
            <span className="block text-[13px] font-bold">MIKKO</span>
            <span className="block text-[9.5px] text-cocoa">mini ilova</span>
          </span>
          <span className="flex items-center gap-1 text-[#2A9DD8]">
            <ChevronDown className="h-4 w-4" />
            <EllipsisVertical className="h-4 w-4" />
          </span>
        </div>

        {/* Greeting + cart */}
        <div className="flex h-12 items-center gap-2 px-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-soft ring-2 ring-orange ring-offset-1 ring-offset-[#FFF8F3]">
            <Image src="/images/mikko-bear.png" alt="" width={152} height={110} className="h-4 w-auto" />
          </span>
          <span className="flex-1 leading-tight">
            <span className="block text-[10px] text-cocoa">Assalomu alaykum,</span>
            <span className="block font-display text-[15px] font-semibold">Aziza</span>
          </span>
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white shadow-soft">
            <ShoppingBag className="h-4 w-4" />
            <AnimatePresence>
              {state.added && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.4, 1] }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-orange text-[9px] font-bold text-white"
                >
                  1
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>

        {/* Search */}
        <div className="mx-3 mt-1 flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-[11px] text-cocoa/70 shadow-[0_6px_16px_-12px_rgba(0,0,0,0.4)]">
          <Search className="h-3.5 w-3.5" /> Kiyim qidirish...
        </div>

        {/* Category chips */}
        <div className="mt-3 flex gap-2.5 overflow-hidden px-3">
          {chips.map((chip) => (
            <span key={chip.label} className="flex w-[48px] shrink-0 flex-col items-center gap-1">
              <span className="rounded-full bg-[conic-gradient(from_200deg,#FE6700,#FFB36B,#FF7FA8,#FE6700)] p-[2px]">
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#FFF8F3] bg-white text-orange-deep">
                  <chip.icon className="h-4 w-4" />
                </span>
              </span>
              <span className="w-full truncate text-center text-[8.5px] font-semibold">{chip.label}</span>
            </span>
          ))}
        </div>

        {/* Banner */}
        <div className="relative mx-3 mt-3 h-[82px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFE1C7] to-[#FFC593] p-3">
          <span className="block font-display text-[15px] font-semibold leading-none">Yangi kolleksiya</span>
          <span className="mt-1 block text-[9px] text-ink/70">Kuz–qish 2026</span>
          <span className="mt-2 inline-block rounded-full bg-ink px-2 py-1 text-[8.5px] font-bold text-white">Ko&apos;rish</span>
          <Image src="/images/model-boy-winter.webp" alt="" width={200} height={200} className="absolute -bottom-2 right-1 h-[96px] w-auto" />
        </div>

        {/* Product grid */}
        <p className="mt-3 flex items-center gap-1 px-3 text-[12.5px] font-bold">
          Yangi kelganlar <Sparkles className="h-3 w-3 text-orange" />
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 px-3">
          {cards.map((product, i) => (
            <motion.div
              key={product.slug}
              animate={state.finger && i === 1 && state.tap ? { scale: 0.94 } : { scale: 1 }}
              className={clsx('rounded-2xl bg-white p-1.5 shadow-[0_8px_20px_-16px_rgba(0,0,0,0.5)]', i === 1 && state.sheet && 'ring-2 ring-orange')}
            >
              <span className="relative block h-[86px] rounded-xl bg-[#FFF3EA]">
                <Image src={product.images[0]} alt="" fill sizes="120px" className="object-contain p-1" />
              </span>
              <span className="mt-1 block truncate px-0.5 text-[9.5px] font-semibold">{product.name}</span>
              <span className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-bold text-orange-deep">{formatPrice(product.price)}</span>
                <span className="grid h-4 w-4 place-items-center rounded-full bg-ink text-white">
                  <ShoppingBag className="h-2.5 w-2.5" />
                </span>
              </span>
            </motion.div>
          ))}
        </div>

        {/* Product sheet */}
        <AnimatePresence>
          {state.sheet && hero && (
            <>
              <motion.div className="absolute inset-0 z-10 bg-ink/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              <motion.div
                className="absolute inset-x-0 bottom-0 z-20 h-[330px] rounded-t-[24px] bg-white px-4 pt-2"
                initial={{ y: 330 }}
                animate={{ y: 0 }}
                exit={{ y: 330 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <span className="mx-auto block h-1 w-9 rounded-full bg-ink/15" />
                <span className="relative mt-2 block h-[118px] rounded-2xl bg-[#FFF3EA]">
                  <Image src={hero.images[0]} alt="" fill sizes="200px" className="object-contain p-2" />
                </span>
                <span className="mt-2 block text-[13px] font-bold leading-tight">{hero.name}</span>
                <span className="block text-[13px] font-bold text-orange-deep">{formatPrice(hero.price)}</span>
                <span className="mt-2 flex gap-1.5">
                  {['98', '104', '110', '116'].map((size) => (
                    <motion.span
                      key={size}
                      animate={size === '110' && state.size ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      className={clsx(
                        'grid h-[34px] w-[50px] place-items-center rounded-xl border text-[11.5px] font-bold transition-colors',
                        size === '110' && state.size ? 'border-orange bg-orange text-white' : 'border-ink/10',
                      )}
                    >
                      {size}
                    </motion.span>
                  ))}
                </span>
                <motion.span
                  animate={state.tap && state.size ? { scale: 0.96 } : { scale: 1 }}
                  className="absolute inset-x-4 bottom-4 grid h-11 place-items-center rounded-2xl bg-orange text-[12.5px] font-bold text-white"
                >
                  Savatga qo&apos;shish · {formatPrice(hero.price)}
                </motion.span>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Toast + Telegram MainButton after adding */}
        <AnimatePresence>
          {state.added && hero && (
            <>
              <motion.span
                key="toast"
                className="absolute bottom-[72px] left-1/2 z-30 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-[10.5px] font-semibold text-white shadow-lift"
                style={{ x: '-50%' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-orange">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                Savatga qo&apos;shildi
              </motion.span>
              <motion.div
                key="main"
                className="absolute inset-x-0 bottom-0 z-20 bg-[#FFF8F3] px-3 pb-4 pt-2"
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                exit={{ y: 80 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <span className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-orange text-[12px] font-bold text-white">
                  <ShoppingBag className="h-3.5 w-3.5" /> Savat · 1 ta · {formatPrice(hero.price)}
                </span>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* The demo "finger" */}
        <AnimatePresence>
          {state.finger && (
            <motion.span
              key="finger"
              className="pointer-events-none absolute z-30 -ml-4 -mt-4 h-8 w-8 rounded-full border-2 border-white bg-white/45 shadow-[0_4px_14px_rgba(0,0,0,0.3)]"
              initial={{ opacity: 0, scale: 0.6, x: state.finger.x, y: state.finger.y + 40 }}
              animate={{ opacity: 1, scale: state.tap ? 0.75 : 1, x: state.finger.x, y: state.finger.y }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              style={{ left: 0, top: 0 }}
            >
              {state.tap && <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
