'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { buttonClass } from '@/components/ui/buttonClass';
import { formatPrice } from '@/lib/format';
import { getProduct } from '@/lib/products';
import type { Product } from '@/lib/types';

// Garments that look right on a hanger (no shoes / bags).
const RACK = [
  'qizil-kurtka',
  'bej-ayiqcha-sviter',
  'kok-sport-kostyum',
  'jigarrang-parka',
  'krem-sviter-mishka',
  'trikotaj-komplekt',
  'kok-kostyum-mishkalar',
]
  .map(getProduct)
  .filter((product): product is Product => Boolean(product));

function Hanger() {
  return (
    <svg viewBox="0 0 120 60" className="absolute left-1/2 top-0 w-[70%] -translate-x-1/2" aria-hidden="true">
      <path
        d="M60 30 V17 a8 8 0 1 1 8 -8"
        fill="none"
        stroke="#9AA0A6"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M8 54 L60 28 L112 54"
        fill="none"
        stroke="#C98A52"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Garment({
  product,
  index,
  inView,
  dimmed,
  onHover,
  onOpen,
}: {
  product: Product;
  index: number;
  inView: boolean;
  dimmed: boolean;
  onHover: (slug: string | null) => void;
  onOpen: (product: Product) => void;
}) {
  const reduce = useReducedMotion();
  const swing = useAnimationControls();
  const [hovered, setHovered] = useState(false);

  // Slide along the rail, then settle with a little pendulum swing.
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      swing.set({ x: 0, opacity: 1, rotate: 0 });
      return;
    }
    swing.start({
      x: 0,
      opacity: 1,
      rotate: [12, -8, 5, -2, 0],
      transition: {
        x: { type: 'spring', stiffness: 60, damping: 15, delay: index * 0.1 },
        opacity: { duration: 0.4, delay: index * 0.1 },
        rotate: { duration: 1.8, ease: 'easeOut', delay: index * 0.1 + 0.3 },
      },
    });
  }, [inView, index, reduce, swing]);

  function push(movementX: number) {
    if (reduce) return;
    const amp = Math.max(-12, Math.min(12, movementX * 0.9)) || 7;
    swing.start({
      rotate: [0, amp, -amp * 0.6, amp * 0.3, 0],
      transition: { duration: 1.4, ease: 'easeOut' },
    });
  }

  return (
    <li className="relative w-[46vw] shrink-0 snap-center sm:w-[30vw] lg:w-auto lg:shrink">
      <motion.button
        type="button"
        onClick={() => onOpen(product)}
        onPointerEnter={(event) => {
          setHovered(true);
          onHover(product.slug);
          push(event.movementX);
        }}
        onPointerLeave={() => {
          setHovered(false);
          onHover(null);
        }}
        onFocus={() => onHover(product.slug)}
        onBlur={() => onHover(null)}
        aria-label={`${product.name}, ${formatPrice(product.price)} — yaqinroq ko'rish`}
        initial={reduce ? false : { x: 320, opacity: 0, rotate: 0 }}
        animate={swing}
        style={{ transformOrigin: '50% 0%' }}
        className={clsx(
          'relative block w-full text-left transition-[opacity,filter] duration-500',
          dimmed && 'opacity-60 saturate-[0.7]',
        )}
      >
        {/* Idle breathing sway, offset per garment so the rack feels alive. */}
        <span
          className="block origin-top animate-sway"
          style={{ animationDelay: `${-index * 0.9}s`, animationDuration: `${5 + (index % 3)}s` }}
        >
          <span className="relative block aspect-[3/4]">
            <Hanger />
            <motion.span
              animate={hovered && !reduce ? { y: -8, scale: 1.07 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="absolute inset-x-0 bottom-0 top-[11%] block"
            >
              <motion.span layoutId={`rack-${product.slug}`} className="absolute inset-0 block">
                <Image
                  src={product.images[0]}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 14vw, 46vw"
                  className={clsx(
                    'object-contain object-top transition-[filter] duration-500',
                    hovered
                      ? 'drop-shadow-[0_30px_24px_rgba(38,32,28,0.3)]'
                      : 'drop-shadow-[0_14px_12px_rgba(38,32,28,0.16)]',
                  )}
                />
              </motion.span>
            </motion.span>

            {product.badge === 'new' && (
              <span className="absolute left-1 top-[14%] z-10 -rotate-6 rounded-full bg-orange px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white shadow-tag">
                Yangi
              </span>
            )}
          </span>
        </span>
      </motion.button>

      {/* Floor shadow tightens on hover as the garment lifts; name + price sit on the floor. */}
      <span
        aria-hidden="true"
        className={clsx(
          'mx-auto -mt-2 block h-3 rounded-[50%] bg-ink/15 blur-md transition-all duration-500',
          hovered ? 'w-[45%] opacity-60' : 'w-[70%] opacity-100',
        )}
      />
      <span className="mt-3 block px-1 text-center">
        <span className="block truncate text-[12.5px] font-semibold">{product.name}</span>
        <span
          className={clsx(
            'mt-0.5 inline-block rounded-full px-2 py-0.5 text-[12px] font-bold tabular-nums transition-colors duration-300',
            hovered ? 'bg-orange text-white' : 'text-orange-deep',
          )}
        >
          {formatPrice(product.price)}
        </span>
      </span>
    </li>
  );
}

function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, setCartOpen } = useStore();
  const reduce = useReducedMotion();
  const [side, setSide] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [needSize, setNeedSize] = useState(false);
  const [added, setAdded] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const views = product.images.slice(0, 2);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-3 sm:p-6">
      <motion.button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="relative grid max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-shell shadow-lift md:grid-cols-[1.05fr_1fr]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-soft transition-colors hover:bg-orange hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative bg-orange-mist p-6">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px]">
            {side === 0 ? (
              <motion.div layoutId={`rack-${product.slug}`} className="absolute inset-0">
                <Image
                  src={views[0]}
                  alt={product.name}
                  fill
                  sizes="340px"
                  className="object-contain drop-shadow-[0_24px_24px_rgba(38,32,28,0.2)]"
                />
              </motion.div>
            ) : (
              <motion.div
                key={side}
                initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: -70 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image src={views[side]} alt={`${product.name} — detal`} fill sizes="340px" className="object-contain" />
              </motion.div>
            )}
          </div>
          {views.length > 1 && (
            <div className="mt-4 flex justify-center gap-2" role="group" aria-label="Ko'rinish">
              {['Old tomoni', 'Detal'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSide(i)}
                  aria-pressed={side === i}
                  className={clsx(
                    'rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors',
                    side === i ? 'bg-ink text-cream' : 'bg-white text-ink hover:bg-orange-soft',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col p-6 md:p-7">
          <h3 id="quick-view-title" className="pr-10 text-[24px] leading-tight">
            {product.name}
          </h3>
          <p className="mt-2 text-[22px] font-semibold tabular-nums text-orange-deep">
            {formatPrice(product.price)}
            {product.oldPrice && (
              <span className="ml-2 text-[14px] font-medium text-cocoa line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </p>
          <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-cocoa">
            {product.description}
          </p>

          <p className="mt-5 text-[12.5px] font-bold">O&apos;lcham</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSize(option);
                  setNeedSize(false);
                }}
                aria-pressed={size === option}
                className={clsx(
                  'h-10 min-w-[46px] rounded-xl border text-[13px] font-semibold tabular-nums transition-colors',
                  size === option ? 'border-ink bg-ink text-cream' : 'border-ink/12 bg-white hover:border-ink/45',
                )}
              >
                {option}
              </button>
            ))}
          </div>
          {needSize && (
            <p className="mt-2 text-[12px] font-medium text-orange-deep">Iltimos, o&apos;lchamni tanlang</p>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-6">
            <button
              type="button"
              onClick={() => {
                if (!size) return setNeedSize(true);
                addToCart({ slug: product.slug, size, color: product.colors[0]?.name ?? 'Standart' });
                setAdded(true);
              }}
              className={buttonClass('primary', 'md', 'h-12 w-full')}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={3} />
                  Savatga qo&apos;shildi
                </>
              ) : (
                "Savatga qo'shish"
              )}
            </button>
            {added ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setCartOpen(true);
                }}
                className={buttonClass('outline', 'md', 'h-12 w-full')}
              >
                Savatni ochish
              </button>
            ) : (
              <Link href={`/product/${product.slug}`} className={buttonClass('outline', 'md', 'h-12 w-full')}>
                Batafsil
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ClothingRack() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState<Product | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section className="container-page mt-16 md:mt-24" aria-labelledby="rack-title">
      <div id="rack-title">
        <SectionHeading
          eyebrow="MIKKO butigi"
          title="Javondan tanlang"
          description="Kiyim ustiga olib boring — u tebranib salom beradi. Bosing va yaqinroq ko'ring."
          href="/catalog?sort=new"
          linkLabel="Butun katalog"
        />
      </div>

      <div ref={ref} className="relative mt-8 overflow-hidden rounded-[32px] bg-[#FFF3E8] md:rounded-[44px]">
        {/* Boutique wall: warm spotlights from above. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_30%_55%_at_20%_0%,rgba(255,255,255,0.95),transparent_70%),radial-gradient(ellipse_30%_55%_at_50%_0%,rgba(255,255,255,0.9),transparent_70%),radial-gradient(ellipse_30%_55%_at_80%_0%,rgba(255,255,255,0.95),transparent_70%)]"
        />
        {/* Wooden floor. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-[#F3DCC6] to-[#E9C9A9]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_119px,rgba(120,72,36,0.08)_119px,rgba(120,72,36,0.08)_120px)]" />
        </div>

        <div className="relative px-3 pb-8 pt-10 md:px-10 md:pb-10 md:pt-12">
          {/* Rail sits on the hook line (top of every hanger). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 top-[38px] z-0 md:inset-x-8 md:top-[46px]"
          >
            <div className="h-2 rounded-full bg-gradient-to-b from-[#EEF0F2] via-[#A9AEB4] to-[#6F757C] shadow-[0_8px_12px_-6px_rgba(0,0,0,0.4)]" />
            <span className="absolute -top-10 left-0 h-12 w-2 rounded-full bg-gradient-to-r from-[#9AA0A6] to-[#6F757C]" />
            <span className="absolute -top-10 right-0 h-12 w-2 rounded-full bg-gradient-to-r from-[#9AA0A6] to-[#6F757C]" />
          </div>

          <ul
            className="relative z-10 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 [scrollbar-width:none] lg:grid lg:snap-none lg:grid-cols-7 lg:gap-3 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Kiyimlar javoni"
          >
            {RACK.map((product, index) => (
              <Garment
                key={product.slug}
                product={product}
                index={index}
                inView={inView}
                dimmed={hovered !== null && hovered !== product.slug}
                onHover={setHovered}
                onOpen={setOpen}
              />
            ))}
          </ul>

          <p className="mt-5 text-center text-[12px] font-medium text-cocoa lg:hidden">
            ← Suring va tanlang →
          </p>
        </div>
      </div>

      <AnimatePresence>
        {open && <QuickView key={open.slug} product={open} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
